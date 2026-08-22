import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { VoiceSearchButton } from '@/components/products/VoiceSearchButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
          </div>
        )}
      </div>
      <div className="container mx-auto px-4 mb-8 pt-8 border-t border-border">
        <RecommendationCarousel title="Recommended for you" />
      </div>
    </Layout>
  );
}
