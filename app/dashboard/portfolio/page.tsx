"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useNiche } from "../../contexts/NicheContext"
import { toast } from "sonner"
import { 
  UploadCloud, Image as ImageIcon, Package, Plus, Trash2, Edit3, 
  Filter, Loader2, Smartphone, X, CheckCircle2, AlertCircle 
} from "lucide-react"

// Tipagens
type Photo = { id: string; url: string; category: string }
type Product = { id: string; name: string; price: number; stock: number; image_url: string }

export default function PortfolioPage() {
  const { config } = useNiche()
  const t = config.theme
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'catalogo'>('portfolio')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dados
  const [photos, setPhotos] = useState<Photo[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  // Estados de Upload
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Estados do Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '', image_url: '' })
  const [isSavingProduct, setIsSavingProduct] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const productImgRef = useRef<HTMLInputElement>(null)
  
  // Categorias (Dica: No futuro, busque isso de uma tabela 'settings')
  const categories = ['Todos', ...config.categories || ['Cortes', 'Barba', 'Geral']]

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [portfolioRes, productsRes] = await Promise.all([
        supabase.from('portfolio').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])
      
      if (portfolioRes.data) setPhotos(portfolioRes.data)
      if (productsRes.data) setProducts(productsRes.data)
      setIsLoading(false)
    }
    fetchData()
  }, [supabase])

  // Função Auxiliar de Upload (Reutilizável para Portfolio e Produtos)
  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { publicUrl, filePath }
  }

  // Handle Portfolio Upload
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setIsUploading(true)
    try {
      const { publicUrl } = await uploadFile(file, 'portfolio_images')

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
      toast.success('Galeria atualizada!')
    } catch (error: any) {
      toast.error('Falha no upload: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Salvar Produto (Com suporte a imagem)
  const handleSaveProduct = async () => {
    if (!userId || !productForm.name || !productForm.price) return toast.error('Dados incompletos')

    setIsSavingProduct(true)
    try {
      const payload = {
        user_id: userId,
        name: productForm.name,
        price: parseFloat(String(productForm.price).replace(',', '.')),
        stock: parseInt(String(productForm.stock) || '0'),
        image_url: productForm.image_url
      }

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p))
      } else {
        const { data, error } = await supabase.from('products').insert([payload]).select().single()
        if (error) throw error
        setProducts([data, ...products])
      }
      setIsProductModalOpen(false)
      toast.success('Catálogo atualizado!')
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  // Deletar com Feedback Visual
  const handleDelete = async (id: string, table: 'portfolio' | 'products') => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) {
      if (table === 'portfolio') setPhotos(photos.filter(p => p.id !== id))
      else setProducts(products.filter(p => p.id !== id))
      toast.success('Removido com sucesso')
    }
  }

  if (isLoading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <div className={`h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-${t.primaryBg.replace('bg-', '')}`} />
      <p className="animate-pulse text-zinc-500 font-medium text-sm">Organizando sua vitrine...</p>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 pt-4">
      
      {/* Header Premium */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            Vitrine <span className={t.textHighlight}>Digital</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gerencie seu portfólio e estoque em tempo real.</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <button 
                onClick={() => setActiveTab('portfolio')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'portfolio' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
              >
                Portfólio
              </button>
              <button 
                onClick={() => setActiveTab('catalogo')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'catalogo' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
              >
                Produtos
              </button>
           </div>
           <button 
            onClick={() => setShowPreview(!showPreview)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
           >
             <Smartphone className={`h-5 w-5 ${showPreview ? t.textHighlight : 'text-zinc-400'}`} />
           </button>
        </div>
      </header>

      <div className={`grid gap-8 transition-all duration-500 ${showPreview ? 'lg:grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
        
        <main className="space-y-8">
          {activeTab === 'portfolio' ? (
            <section className="space-y-6 animate-in slide-in-from-bottom-4">
              {/* Dropzone de Upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all cursor-pointer relative overflow-hidden"
              >
                {isUploading ? (
                   <div className="text-center">
                      <Loader2 className={`h-10 w-10 animate-spin mx-auto ${t.textHighlight}`} />
                      <p className="mt-4 font-bold text-zinc-900 dark:text-white">Subindo arquivo...</p>
                   </div>
                ) : (
                  <>
                    <div className={`h-16 w-16 rounded-3xl ${t.primaryBg} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">Adicionar à Galeria</h3>
                    <p className="text-zinc-500 text-sm mt-1">Arraste fotos ou clique para navegar</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.filter(p => activeCategory === 'Todos' || p.category === activeCategory).map(photo => (
                  <div key={photo.id} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <img src={photo.url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Job" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                      <div className="flex w-full justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-black text-white/90">{photo.category}</span>
                        <button onClick={() => handleDelete(photo.id, 'portfolio')} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Seu Inventário</h2>
                <button 
                  onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', stock: '', image_url: '' }); setIsProductModalOpen(true); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${t.primaryBg} text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all`}
                >
                  <Plus className="h-5 w-5" /> Novo Produto
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {products.map(product => (
                  <div key={product.id} className="group flex items-center gap-4 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md transition-all">
                    <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700">
                      <img src={product.image_url || 'https://via.placeholder.com/150'} className="h-full w-full object-cover" alt={product.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-zinc-900 dark:text-white truncate">{product.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm font-black ${t.textHighlight}`}>R$ {Number(product.price).toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">QTD: {product.stock}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => { setEditingProduct(product); setProductForm({ name: product.name, price: product.price.toString(), stock: product.stock.toString(), image_url: product.image_url }); setIsProductModalOpen(true); }} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id, 'products')} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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
                    <p className="text-xs font-medium opacity-80">Confira nosso catálogo</p>
                  </div>
                  
                  <div className="p-6 space-y-8">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Portfólio</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {photos.slice(0, 4).map(p => (
                          <img key={p.id} src={p.url} className="aspect-square rounded-2xl object-cover shadow-sm" alt="Preview" />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Destaques</h4>
                      <div className="space-y-3">
                        {products.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                             <img src={p.image_url} className="h-12 w-12 rounded-xl object-cover" alt="Thumb" />
                             <div>
                               <p className="text-xs font-bold text-zinc-900 dark:text-white">{p.name}</p>
                               <p className={`text-[10px] font-black ${t.textHighlight}`}>R$ {Number(p.price).toFixed(2)}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </aside>
        )}
      </div>

      {/* Modal de Produto - Redesenhado */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in">
           <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{editingProduct ? 'Editar' : 'Novo'} Produto</h3>
                  <p className="text-sm text-zinc-500">Configure os detalhes do item.</p>
                </div>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Upload de Imagem do Produto */}
                <div className="flex justify-center">
                   <div 
                    onClick={() => productImgRef.current?.click()}
                    className="group relative h-32 w-32 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                   >
                     {productForm.image_url ? (
                       <>
                        <img src={productForm.image_url} className="h-full w-full object-cover" alt="Product Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="text-white h-6 w-6" />
                        </div>
                       </>
                     ) : (
                       <div className="text-center p-4">
                         <ImageIcon className="h-6 w-6 mx-auto text-zinc-400" />
                         <span className="text-[10px] font-bold text-zinc-500 uppercase mt-2 block">Foto</span>
                       </div>
                     )}
                     <input 
                      ref={productImgRef} 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          toast.promise(uploadFile(file, 'portfolio_images'), {
                            loading: 'Subindo imagem...',
                            success: (data) => {
                              setProductForm({ ...productForm, image_url: data.publicUrl });
                              return 'Imagem carregada!';
                            },
                            error: 'Erro no upload'
                          });
                        }
                      }} 
                     />
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Nome do Produto</label>
                    <input 
                      value={productForm.name} 
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 font-medium focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                      placeholder="Ex: Pomada Modeladora"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Preço</label>
                      <input 
                        type="text"
                        value={productForm.price} 
                        onChange={e => setProductForm({...productForm, price: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 font-medium outline-none transition-all"
                        placeholder="0,00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Estoque</label>
                      <input 
                        type="number"
                        value={productForm.stock} 
                        onChange={e => setProductForm({...productForm, stock: e.target.value})}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 font-medium outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveProduct}
                  disabled={isSavingProduct}
                  className={`w-full py-4 rounded-[1.5rem] ${t.primaryBg} text-white font-black text-lg shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2`}
                >
                  {isSavingProduct ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                  Confirmar Alterações
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}