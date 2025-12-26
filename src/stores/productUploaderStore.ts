import { create } from 'zustand';
import type { AIProductData } from '@/types/product';

interface ProductUploaderState {
  // Image state
  selectedImage: File | null;
  imagePreview: string | null;
  
  // AI Analysis state
  isAnalyzing: boolean;
  analysisProgress: string;
  streamedContent: string;
  aiData: AIProductData | null;
  analysisError: string | null;
  
  // Form state (editable by admin)
  editedData: Partial<AIProductData> | null;
  
  // Actions
  setSelectedImage: (file: File | null) => void;
  setImagePreview: (preview: string | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: string) => void;
  setStreamedContent: (content: string) => void;
  appendStreamedContent: (chunk: string) => void;
  setAIData: (data: AIProductData | null) => void;
  setAnalysisError: (error: string | null) => void;
  setEditedData: (data: Partial<AIProductData> | null) => void;
  updateEditedField: <K extends keyof AIProductData>(field: K, value: AIProductData[K]) => void;
  reset: () => void;
}

const initialState = {
  selectedImage: null,
  imagePreview: null,
  isAnalyzing: false,
  analysisProgress: '',
  streamedContent: '',
  aiData: null,
  analysisError: null,
  editedData: null,
};

export const useProductUploaderStore = create<ProductUploaderState>((set) => ({
  ...initialState,
  
  setSelectedImage: (file) => set({ selectedImage: file }),
  setImagePreview: (preview) => set({ imagePreview: preview }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setAnalysisProgress: (progress) => set({ analysisProgress: progress }),
  setStreamedContent: (content) => set({ streamedContent: content }),
  appendStreamedContent: (chunk) => set((state) => ({ 
    streamedContent: state.streamedContent + chunk 
  })),
  setAIData: (data) => set({ aiData: data, editedData: data ? { ...data } : null }),
  setAnalysisError: (error) => set({ analysisError: error }),
  setEditedData: (data) => set({ editedData: data }),
  updateEditedField: (field, value) => set((state) => ({
    editedData: state.editedData ? { ...state.editedData, [field]: value } : null
  })),
  reset: () => set(initialState),
}));
