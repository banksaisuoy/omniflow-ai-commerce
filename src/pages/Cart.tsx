import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
            <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p as unknown as ComponentProps<typeof ProductCard>['product']} />
              ))}
            </div>
          </div>

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl mb-8">ตะกร้าขนม</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          </div>
        </div>
      </div>

      {recentlyViewedProducts.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">สินค้าที่คุณอาจสนใจ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p as unknown as ComponentProps<typeof ProductCard>['product']} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
