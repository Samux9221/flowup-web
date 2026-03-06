"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useNiche } from "../../contexts/NicheContext"
import { toast } from "sonner"
import { UploadCloud, Trash2, Loader2, Smartphone } from "lucide-react"

// Tipagens
type Photo = { id: string; url: string; category: string }

export default function PortfolioPage() {
  const { config } = useNiche()
  const t = config.theme
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dados
  const [photos, setPhotos] = useState<Photo[]>([])
  
  // Estados de Upload
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Categorias
  const categories = ['Todos', ...config.categories || ['Cortes', 'Barba', 'Geral']]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) setPhotos(data)
      setIsLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('portfolio_images').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('portfolio_images').getPublicUrl(filePath)

      const { data, error: dbError } = await supabase
        .from('portfolio')
        .insert([{ 
          user_id: userId, 
          url: publicUrl, 
          category: activeCategory !== 'Todos' ? activeCategory : 'Geral' 
        }])
        .select().single()

      if (dbError) throw dbError
      setPhotos([data, ...photos])
      toast.success('Foto adicionada ao portfólio!')
    } catch (error: any) {
      toast.error('Falha no upload: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta foto da sua vitrine pública?")) return
    const { error } = await supabase.from('portfolio').delete().eq('id', id)
    if (!error) {
      setPhotos(photos.filter(p => p.id !== id))
      toast.success('Foto removida com sucesso')
    } else {
      toast.error('Erro ao remover foto.')
    }
  }

  if (isLoading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <div className={`h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-${t.primaryBg.replace('bg-', '')}`} />
      <p className="animate-pulse text-zinc-500 font-medium text-sm">Organizando sua galeria...</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 pt-4">
      
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Galeria de <span className={t.textHighlight}>Cortes</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Exiba seus melhores trabalhos para atrair mais clientes.</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors font-bold text-sm ${showPreview ? `${t.bgPrimary} ${t.textOnPrimary} border-transparent` : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
           >
             <Smartphone className="h-4 w-4" /> {showPreview ? 'Ocultar Celular' : 'Ver como o Cliente'}
           </button>
        </div>
      </header>

      <div className={`grid gap-8 transition-all duration-500 ${showPreview ? 'lg:grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
        
        <main className="space-y-8">
          <section className="space-y-6 animate-in slide-in-from-bottom-4">
            {/* Dropzone de Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all cursor-pointer relative overflow-hidden"
            >
              {isUploading ? (
                 <div className="text-center">
                    <Loader2 className={`h-10 w-10 animate-spin mx-auto ${t.textHighlight}`} />
                    <p className="mt-4 font-bold text-zinc-900 dark:text-white">Subindo foto...</p>
                 </div>
              ) : (
                <>
                  <div className={`h-16 w-16 rounded-3xl ${t.primaryBg} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">Adicionar à Galeria</h3>
                  <p className="text-zinc-500 text-sm mt-1">Arraste fotos ou clique para procurar no celular</p>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleUploadPhoto} disabled={isUploading} />
            </div>

            {/* Filtros Estilizados */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === cat ? `${t.primaryBg} border-transparent text-white shadow-md scale-105` : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid de Fotos */}
            {photos.length === 0 ? (
               <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-900/20 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                 <p className="text-sm font-medium text-zinc-500">Nenhuma foto no portfólio ainda.</p>
               </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.filter(p => activeCategory === 'Todos' || p.category === activeCategory).map(photo => (
                  <div key={photo.id} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <img src={photo.url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Corte" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                      <div className="flex w-full justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-black text-white/90">{photo.category}</span>
                        <button onClick={() => handleDelete(photo.id)} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Preview Mobile - Estilo iPhone */}
        {showPreview && (
          <aside className="hidden lg:block sticky top-8 animate-in slide-in-from-right-10 duration-500">
             <div className="relative mx-auto h-[720px] w-[340px] rounded-[3.5rem] border-[10px] border-zinc-900 bg-white dark:bg-zinc-950 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-zinc-900 rounded-b-2xl z-20" />
                
                <div className="h-full overflow-y-auto no-scrollbar">
                  <div className={`h-40 ${t.primaryBg} p-8 flex flex-col justify-end text-white`}>
                    <h3 className="text-xl font-black">{config.title}</h3>
                    <p className="text-xs font-medium opacity-80">Nosso trabalho</p>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Portfólio</h4>
                      {photos.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">Sem fotos para exibir.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {photos.slice(0, 8).map(p => (
                            <img key={p.id} src={p.url} className="aspect-square rounded-2xl object-cover shadow-sm" alt="Preview" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  )
}