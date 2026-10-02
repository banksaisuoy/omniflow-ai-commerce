import { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border shadow-xl rounded-xl p-4 flex flex-col gap-3 w-64"
          >
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-sm">ติดต่อสอบถาม / Need Help?</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-1">มีคำถามเกี่ยวกับขนมไทย? ทักหาเราได้เลยค่ะ</p>
            <Button
              className="w-full justify-start gap-2 bg-[#00B900] hover:bg-[#009900] text-white shadow-sm"
              onClick={() => window.open('https://line.me/ti/p/~', '_blank')}
            >
              <MessageCircle className="h-4 w-4" />
              Chat on LINE
            </Button>
            <Button
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={() => window.open('tel:+66123456789', '_self')}
            >
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        className="rounded-full shadow-xl h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Support"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    </div>
  );
}
