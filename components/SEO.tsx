import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, url, type = 'website' }) => {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper for OG tags (Facebook/Discord/WhatsApp previews)
    const updateProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // Open Graph / Facebook / WhatsApp / Telegram
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:type', type);
    updateProperty('og:site_name', 'ZonaGM');
    if (url) updateProperty('og:url', url);
    if (image) {
      updateProperty('og:image', image);
      updateProperty('og:image:secure_url', image);
      updateProperty('og:image:type', 'image/jpeg');
      updateProperty('og:image:width', '1200');
      updateProperty('og:image:height', '630');
      updateProperty('og:image:alt', title);
    }

    // Twitter Cards (X, Discord)
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    if (image) updateMeta('twitter:image', image);

  }, [title, description, image, url, type]);

  return null;
};

export default SEO;