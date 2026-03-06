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
  bgPrimary: string;
  textOnPrimary: string;        
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
  categories: string[]
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
      radius: "rounded-xl", 
      bgPrimary: "bg-zinc-900 hover:bg-zinc-800",
      textOnPrimary: "text-white",
    },
    examples: {
      service: "Ex: Corte Degradê",
      product: "Ex: Pomada Modeladora",
    },
    categories: ["Cortes", "Barba", "Química", "Pigmentação", "Geral"],
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
      primaryBg: "bg-rose-500", 
      primaryHover: "hover:bg-rose-600",
      secondaryBg: "bg-rose-50",
      textHighlight: "text-rose-500",
      radius: "rounded-2xl", 
      bgPrimary: "bg-rose-500 hover:bg-rose-600",
      textOnPrimary: "text-white",
    },
    examples: {
      service: "Ex: Mechas / Balaiagem",
      product: "Ex: Máscara de Hidratação",
    },
    categories: ["Cabelo", "Coloração", "Tratamento", "Penteado", "Geral"],
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
      primaryBg: "bg-pink-500", 
      primaryHover: "hover:bg-pink-600",
      secondaryBg: "bg-pink-50",
      textHighlight: "text-pink-500",
      radius: "rounded-2xl", 
      bgPrimary: "bg-pink-500 hover:bg-pink-600",
      textOnPrimary: "text-white",
    },
    examples: {
      service: "Ex: Alongamento em Gel",
      product: "Ex: Óleo de Cutículas", 
    },
    categories: ["Pé & Mão", "Alongamento", "Esmaltação", "Nail Art", "Geral"],
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
      primaryBg: "bg-blue-600",
      primaryHover: "hover:bg-blue-700",
      secondaryBg: "bg-slate-50",
      textHighlight: "text-blue-600",
      radius: "rounded-xl",
      bgPrimary: "bg-blue-600 hover:bg-blue-700",
      textOnPrimary: "text-white",
    },
    examples: {
      service: "Ex: Consultoria",
      product: "Ex: Produto Físico",
    },
    categories: ["Serviços", "Vendas", "Outros", "Geral"],
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