let selectorMap = new Map();

selectorMap.set("https://www.amazon.com", {
  canary: ".askSearchResults > .a-size-base:nth-child(1)",
  moreQAsButton: ".a-section:nth-child(3) > .a-section .a-link-emphasis",
  moreReviewsButton: ".a-section:nth-child(7) .a-link-emphasis",
  nodes: ".askSearchResultsActive > .a-section.a-spacing-base"
});

selectorMap.set("https://www.amazon.in", {
  canary: ".askSearchResults > .a-size-base:nth-child(1)",
  moreQAsButton: ".a-section:nth-child(2) > .a-section > .a-declarative .a-link-emphasis",
  moreReviewsButton: ".a-section:nth-child(6) .a-link-emphasis",
  nodes: ".askSearchResultsActive > .a-section.a-spacing-base"
});

module.exports = {
  selectorMap: selectorMap
};
