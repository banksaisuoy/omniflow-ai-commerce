import { Layout } from '@/components/layout/Layout';
import { useI18n } from '@/stores/i18nStore';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: t('faq_q1'),
      answer: t('faq_a1'),
    },
    {
      question: t('faq_q2'),
      answer: t('faq_a2'),
    },
    {
      question: t('faq_q3'),
      answer: t('faq_a3'),
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('faq')}</h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('search_placeholder') || 'ค้นหาคำถาม...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredFaqs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">ไม่พบผลการค้นหา</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        )}
      </div>
    </Layout>
  );
};

export default FAQ;