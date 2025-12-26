import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProductUploaderStore } from '@/stores/productUploaderStore';

export function ImageUploader() {
  const { 
    selectedImage, 
    imagePreview, 
    isAnalyzing,
    setSelectedImage, 
    setImagePreview,
    reset 
  } = useProductUploaderStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setSelectedImage, setImagePreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    reset();
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 cursor-pointer",
          "hover:border-primary/60 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10 scale-[1.02]",
          isAnalyzing && "pointer-events-none opacity-70",
          imagePreview ? "border-primary/40" : "border-border"
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {imagePreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full max-h-80 object-contain rounded-lg"
              />
              {!isAnalyzing && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isAnalyzing && (
                <motion.div
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-8 w-8 text-primary" />
                    </motion.div>
                    <span className="text-sm text-muted-foreground">AI Analyzing...</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className="p-4 rounded-full bg-primary/10 mb-4"
              >
                {isDragActive ? (
                  <Image className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </motion.div>
              <h3 className="font-semibold text-lg mb-1">
                {isDragActive ? "Drop your image here" : "Upload Product Image"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop or click to select • PNG, JPG, WebP
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>AI will automatically analyze your product</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
