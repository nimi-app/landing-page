export interface GenerateMetaTagsProps {
  title: string
  description: string
  imageUrl: string
  url: string
}

/**
 * Returns the Meta tags for a page
 * @returns
 */
export function MetaTags({
  description,
  title,
  imageUrl,
  url,
}: GenerateMetaTagsProps) {
  const tags = [
    <meta key='page-meta-title' name='title' content={title} />,
    <meta key='page-description' name='description' content={description} />,
  ]

  // Open Graph
  tags.push(
    ...[
      <meta key='og:type' property='og:type' content='website' />,
      <meta key='og:url' property='og:url' content={url} />,
      <meta key='og:title' property='og:title' content={title} />,
      <meta
        key='og:description'
        property='og:description'
        content={description}
      />,
      <meta key='og:image' property='og:image' content={imageUrl} />,
    ]
  )

  // Twitter
  tags.push(
    <meta
      key='twitter:card'
      property='twitter:card'
      content='summary_large_image'
    />,
    <meta key='twitter:url' property='twitter:url' content={url} />,
    <meta key='twitter:title' property='twitter:title' content={title} />,
    <meta
      key='twitter:description'
      property='twitter:description'
      content={description}
    />,
    <meta key='twitter:image' property='twitter:image' content={imageUrl} />
  )

  return <>{tags}</>
}
