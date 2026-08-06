import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: 'https://stellarrail.example/', lastModified: new Date() }]
}
