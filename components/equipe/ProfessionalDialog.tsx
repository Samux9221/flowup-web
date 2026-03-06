"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { Percent, BadgeDollarSign, ShieldAlert, Package, Scissors } from "lucide-react"

export default function ProfessionalDialog({ isOpen, onClose, onSuccess, userId, t, professionalToEdit }: any) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  
  const [serviceType, setServiceType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [serviceValue, setServiceValue] = useState("")
  const [productValue, setProductValue] = useState("")
  const [discountFees, setDiscountFees] = useState(false)

  // 🔹 Preenche o formulário se for "Edição"
  useEffect(() => {
    if (professionalToEdit && isOpen) {
      setName(professionalToEdit.name || "")
      setBio(professionalToEdit.bio || "")

      const serviceRule = professionalToEdit.commission_rules?.find((r: any) => r.item_type === 'SERVICE')
      const productRule = professionalToEdit.commission_rules?.find((r: any) => r.item_type === 'PRODUCT')

      if (serviceRule) {
        setServiceType(serviceRule.commission_type)
        setServiceValue(serviceRule.commission_value.toString())
        setDiscountFees(serviceRule.discount_fees_first)
      }

      if (productRule) {
        setProductValue(productRule.commission_value.toString())
      } else {
        setProductValue("")
      }
    } else if (isOpen && !professionalToEdit) {
      // Limpa tudo se for "Novo"
      setName(""); setBio(""); setServiceValue(""); setProductValue(""); setDiscountFees(false); setServiceType("PERCENTAGE");
    }
  }, [professionalToEdit, isOpen])

  const handleSave = async () => {
    if (!name || !serviceValue) {
      toast.error("O nome e a comissão de serviço são obrigatórios.")
      return
    }

    setIsSaving(true)
    let profId = professionalToEdit?.id

    if (profId) {
      // 🔹 FLUXO DE EDIÇÃO
      const { error: profError } = await supabase.from("professionals").update({ name, bio }).eq("id", profId)
      if (profError) { toast.error("Erro ao atualizar dados básicos."); setIsSaving(false); return; }
      
      // Apaga as regras antigas para reescrever as novas perfeitamente
      await supabase.from("commission_rules").delete().eq("professional_id", profId)
    } else {
      // 🔹 FLUXO DE CRIAÇÃO
      const { data: profData, error: profError } = await supabase.from("professionals").insert([{ user_id: userId, name, bio }]).select().single()
      if (profError) { toast.error("Erro ao cadastrar profissional."); setIsSaving(false); return; }
      profId = profData.id
    }

    // Grava as regras (Novas ou Atualizadas)
    const rulesToInsert = [{
      professional_id: profId,
      item_type: 'SERVICE',
      commission_type: serviceType,
      commission_value: parseFloat(serviceValue),
      discount_fees_first: discountFees
    }]

    if (productValue && parseFloat(productValue) > 0) {
      rulesToInsert.push({
        professional_id: profId,
        item_type: 'PRODUCT',
        commission_type: 'PERCENTAGE',
        commission_value: parseFloat(productValue),
        discount_fees_first: discountFees
      })
    }

    const { error: ruleError } = await supabase.from("commission_rules").insert(rulesToInsert)
    setIsSaving(false)

    if (ruleError) {
      toast.error("Salvo parcialmente, erro nas regras.")
    } else {
      toast.success(professionalToEdit ? "Profissional atualizado com sucesso!" : "Profissional adicionado!")
      onSuccess(); onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-200/50 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b border-zinc-100">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-zinc-900">
            {professionalToEdit ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-8">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Lucas Silva" className="mt-1 h-12 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Especialidade (Opcional)</Label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ex: Especialista em Degradê" className="mt-1 h-12 rounded-xl" />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-zinc-100">
            <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <Label className="text-sm font-bold text-zinc-900 flex items-center gap-2"><Scissors className="w-4 h-4"/> Comissão de Serviços</Label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setServiceType("PERCENTAGE")} className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${serviceType === "PERCENTAGE" ? 'border-zinc-900 bg-white text-zinc-900 shadow-sm' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100'}`}><Percent className="w-3.5 h-3.5" /> %</button>
                <button onClick={() => setServiceType("FIXED")} className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm transition-all ${serviceType === "FIXED" ? 'border-zinc-900 bg-white text-zinc-900 shadow-sm' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-100'}`}><BadgeDollarSign className="w-3.5 h-3.5" /> Fixo (R$)</button>
              </div>
              <Input type="number" value={serviceValue} onChange={(e) => setServiceValue(e.target.value)} placeholder={serviceType === "PERCENTAGE" ? "Ex: 50" : "Ex: 25.00"} className="h-12 rounded-xl" />
            </div>

            <div className="space-y-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <Label className="text-sm font-bold text-zinc-900 flex items-center gap-2"><Package className="w-4 h-4"/> Comissão em Produtos</Label>
              <p className="text-xs text-zinc-500 leading-relaxed">Quantos porcento este profissional ganha vendendo produtos?</p>
              <div className="relative">
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input type="number" value={productValue} onChange={(e) => setProductValue(e.target.value)} placeholder="Ex: 10" className="h-12 rounded-xl pr-10" />
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center h-5">
                <input id="discountFees" type="checkbox" checked={discountFees} onChange={(e) => setDiscountFees(e.target.checked)} className="w-5 h-5 border-gray-300 rounded text-red-600 focus:ring-red-600" />
              </div>
              <div className="flex-1 text-sm">
                <label htmlFor="discountFees" className="font-semibold text-red-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Descontar Taxas do Cartão
                </label>
                <p className="text-red-700/80 mt-1 text-xs font-medium">Abate as taxas da maquininha antes da comissão.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <Button disabled={isSaving} onClick={handleSave} className={`w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all ${t.bgPrimary} ${t.textOnPrimary}`}>
            {isSaving ? "Salvando..." : professionalToEdit ? "Atualizar Profissional" : "Cadastrar Profissional"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}