import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { removeConsecutiveLinks, markdownToText } from "./markdown";

function cleanHtml($: cheerio.CheerioAPI) {
  $("script").remove();
  $("style").remove();
  $("iframe").remove();
  $("nav").remove();
  $("header").remove();
  $("footer").remove();
  $("p:empty").remove();
  $("div:empty").remove();
}

export function parseHtml(html: string) {
  const $ = cheerio.load(html);

  const links = $("a")
    .map((_, link) => ({
      text: $(link).text().trim(),
      href: $(link).attr("href"),
    }))
    .toArray()
    .filter((link) => link.href);

  const metaTags: { key: string; value: string }[] = $("meta")
    .map((_, meta) => ({
      key: $(meta).attr("name") ?? $(meta).attr("property") ?? "",
      value: $(meta).attr("content") ?? "",
    }))
    .toArray()
    .filter((meta) => meta.key && meta.value);

  $("meta").remove();

  cleanHtml($);

  const turndownService = new TurndownService();
  turndownService.addRule("headings", {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    replacement: function (content, node) {
      const level = Number(node.nodeName.charAt(1));
      return "\n" + "#".repeat(level) + " " + content + "\n\n";
    },
  });

  let markdown = turndownService.turndown($("body").html()!);
  markdown = removeConsecutiveLinks(markdown);

  return {
    markdown,
    links,
    metaTags,
    text: markdownToText(markdown),
  };
}
