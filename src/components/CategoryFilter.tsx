import { useState } from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'all', name: 'All', emoji: '🍽️' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'burger', name: 'Burgers', emoji: '🍔' },
  { id: 'indian', name: 'Indian', emoji: '🍛' },
  { id: 'chinese', name: 'Chinese', emoji: '🥡' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
  { id: 'healthy', name: 'Healthy', emoji: '🥗' },
  { id: 'mexican', name: 'Mexican', emoji: '🌮' },
];

const CategoryFilter = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <section className="py-12 bg-gradient-to-br from-muted/30 to-orange-light/10">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="gradient-text">What are you craving?</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Explore our diverse selection of cuisines and find your perfect meal
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category, index) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "hero" : "glass"}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center space-x-3 min-w-[140px] h-14 rounded-2xl hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-xl">{category.emoji}</span>
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;