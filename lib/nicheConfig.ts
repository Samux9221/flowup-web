import { Scissors, Sparkles, Droplets, Paintbrush } from "lucide-react"

export type NicheType = "barbearia" | "salao_beleza" | "manicure" | "padrao"

export interface NicheFeatures {
  hasGallery: boolean; 
  hasAnamnesis: boolean; 
  hasQuickProducts: boolean; 
}

export interface NicheTheme {
  primaryBg: string;      
  primaryHover: string;   
  secondaryBg: string;    
  textHighlight: string;  
  radius: string;         
}

export interface NicheExamples {
  service: string;
  product: string;
}

export interface NicheConfig {
  title: string
  clientName: string
  professionalName: string
  features: NicheFeatures
  theme: NicheTheme
  examples: NicheExamples
  categories: string[] // 🆕 AQUI ESTÁ A PROPRIEDADE QUE FALTAVA PARA PARAR O ERRO
  icons: {
    primary: any
    service: any
  }
}

export const nicheDictionary: Record<NicheType, NicheConfig> = {
  barbearia: {
    title: "Barbearia",
    clientName: "Cliente",
    professionalName: "Barbeiro",
    features: {
      hasGallery: false,
      hasAnamnesis: false,
      hasQuickProducts: true,
    },
    theme: {
      primaryBg: "bg-zinc-900",
      primaryHover: "hover:bg-zinc-800",
      secondaryBg: "bg-zinc-100",
      textHighlight: "text-zinc-900",
      radius: "rounded-md", 
    },
    examples: {
      service: "Ex: Corte Degradê",
      product: "Ex: Pomada Modeladora",
    },
    categories: ["Cortes", "Barba", "Química", "Pigmentação", "Geral"], // 🆕 Categorias inseridas
    icons: {
      primary: Scissors,
      service: Scissors,
    }
  },
  salao_beleza: {
    title: "Salão de Beleza",
    clientName: "Cliente",
    professionalName: "Profissional",
    features: {
      hasGallery: true,
      hasAnamnesis: true,
      hasQuickProducts: true,
    },
    theme: {
      primaryBg: "bg-rose-400", 
      primaryHover: "hover:bg-rose-500",
      secondaryBg: "bg-rose-50",
      textHighlight: "text-rose-500",
      radius: "rounded-xl", 
    },
    examples: {
      service: "Ex: Mechas / Balaiagem",
      product: "Ex: Máscara de Hidratação",
    },
    categories: ["Cabelo", "Coloração", "Tratamento", "Penteado", "Geral"], // 🆕 Categorias inseridas
    icons: {
      primary: Sparkles,
      service: Droplets,
    }
  },
  manicure: {
    title: "Nail Designer",
    clientName: "Cliente",
    professionalName: "Nail Designer",
    features: {
      hasGallery: true,
      hasAnamnesis: false, 
      hasQuickProducts: false,
    },
    theme: {
      primaryBg: "bg-pink-400", 
      primaryHover: "hover:bg-pink-500",
      secondaryBg: "bg-pink-50",
      textHighlight: "text-pink-500",
      radius: "rounded-2xl", 
    },
    examples: {
      service: "Ex: Alongamento em Gel",
      product: "Ex: Óleo de Cutículas", 
    },
    categories: ["Pé & Mão", "Alongamento", "Esmaltação", "Nail Art", "Geral"], // 🆕 Categorias inseridas
    icons: {
      primary: Paintbrush,
      service: Paintbrush,
    }
  },
  padrao: {
    title: "Negócio",
    clientName: "Cliente",
    professionalName: "Profissional",
    features: {
      hasGallery: false,
      hasAnamnesis: false,
      hasQuickProducts: false,
    },
    theme: {
      primaryBg: "bg-blue-500",
      primaryHover: "hover:bg-blue-600",
      secondaryBg: "bg-slate-50",
      textHighlight: "text-blue-500",
      radius: "rounded-lg",
    },
    examples: {
      service: "Ex: Consultoria",
      product: "Ex: Produto Físico",
    },
    categories: ["Serviços", "Vendas", "Outros", "Geral"], // 🆕 Categorias inseridas
    icons: {
      primary: Sparkles,
      service: Sparkles,
    }
  }
}

export const getNicheConfig = (niche?: NicheType | string | null): NicheConfig => {
  const validNiche = niche as NicheType
  return nicheDictionary[validNiche] || nicheDictionary.padrao
}