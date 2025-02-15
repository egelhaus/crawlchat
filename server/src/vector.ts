export async function extractMarkdownText(content: string): Promise<string> {
  const { remark } = await import("remark");
  const { default: strip } = await import("strip-markdown");
  const processedContent = await remark().use(strip).process(content);
  return processedContent.toString();
}
