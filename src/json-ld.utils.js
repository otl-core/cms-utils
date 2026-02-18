/**
 * JSON-LD structured data generation utilities.
 *
 * Produces a Schema.org @graph for pages, blog posts, and the overall site,
 * using data already available in the CMS (website config, page/post metadata,
 * organization config).
 */

/**
 * Derive breadcrumb items from a URL path.
 *
 * "/" -> [{ name: "Home", path: "/" }]
 * "/about" -> [{ name: "Home", path: "/" }, { name: "About", path: "/about" }]
 * "/blog/my-post" -> [Home, Blog, My Post]
 */
export function buildBreadcrumbs(path, pageTitle) {
  const crumbs = [{ name: "Home", path: "/" }];
  if (path === "/" || path === "") {
    return crumbs;
  }
  const segments = path.replace(/^\//, "").split("/").filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    const segPath = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const name = isLast ? pageTitle : slugToTitle(segments[i]);
    crumbs.push({ name, path: segPath });
  }
  return crumbs;
}

/**
 * Generate a JSON-LD `@graph` object for the given page/post.
 *
 * When an override is provided externally (structured_data_override), callers
 * should use the override directly instead of calling this function.
 */
export function generateJsonLd(input) {
  const {
    siteUrl,
    path,
    locale,
    siteName,
    siteDescription,
    organization,
    page,
    blogPost,
  } = input;
  const canonicalUrl = siteUrl + path;
  const graph = [];
  // ----- WebSite -----
  const websiteNode = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: siteName,
    inLanguage: locale,
  };
  if (siteDescription) {
    websiteNode.description = siteDescription;
  }
  if (organization) {
    websiteNode.publisher = { "@id": `${siteUrl}/#organization` };
  }
  graph.push(websiteNode);
  // ----- Organization -----
  if (organization && hasOrganizationData(organization)) {
    const orgNode = {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
    };
    if (organization.name) orgNode.name = organization.name;
    if (organization.legal_name) orgNode.legalName = organization.legal_name;
    if (organization.logo) {
      orgNode.logo = {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        url: organization.logo,
        contentUrl: organization.logo,
      };
      orgNode.image = { "@id": `${siteUrl}/#logo` };
    }
    if (organization.url) orgNode.url = organization.url;
    if (organization.email) orgNode.email = organization.email;
    if (organization.phone) orgNode.telephone = organization.phone;
    if (organization.description)
      orgNode.description = organization.description;
    if (organization.address) {
      const addr = organization.address;
      const addressNode = {
        "@type": "PostalAddress",
      };
      if (addr.street) addressNode.streetAddress = addr.street;
      if (addr.city) addressNode.addressLocality = addr.city;
      if (addr.region) addressNode.addressRegion = addr.region;
      if (addr.postal_code) addressNode.postalCode = addr.postal_code;
      if (addr.country) addressNode.addressCountry = addr.country;
      orgNode.address = addressNode;
    }
    if (
      organization.social_profiles &&
      organization.social_profiles.length > 0
    ) {
      orgNode.sameAs = organization.social_profiles.map(sp => sp.url);
    }
    graph.push(orgNode);
  }
  // ----- BreadcrumbList -----
  const breadcrumbs =
    input.breadcrumbs ??
    buildBreadcrumbs(path, page?.title ?? blogPost?.title ?? siteName);
  const breadcrumbNode = {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: siteUrl + crumb.path,
    })),
  };
  graph.push(breadcrumbNode);
  // ----- WebPage / FAQPage / etc. -----
  if (page) {
    const schemaType = page.schemaType || "WebPage";
    const pageNode = {
      "@type": schemaType,
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: page.title,
      isPartOf: { "@id": `${siteUrl}/#website` },
      breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
      inLanguage: locale,
    };
    if (page.description) pageNode.description = page.description;
    if (page.datePublished) pageNode.datePublished = page.datePublished;
    if (page.dateModified) pageNode.dateModified = page.dateModified;
    if (page.ogImage) {
      pageNode.primaryImageOfPage = {
        "@type": "ImageObject",
        url: page.ogImage,
      };
    }
    graph.push(pageNode);
  }
  // ----- Article / BlogPosting -----
  if (blogPost) {
    const articleNode = {
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      headline: blogPost.title,
      url: canonicalUrl,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntityOfPage: { "@id": `${canonicalUrl}#webpage` },
      inLanguage: locale,
      datePublished: blogPost.datePublished,
    };
    if (blogPost.dateModified) articleNode.dateModified = blogPost.dateModified;
    if (blogPost.excerpt) articleNode.description = blogPost.excerpt;
    if (blogPost.featuredImage) {
      articleNode.image = {
        "@type": "ImageObject",
        url: blogPost.featuredImage,
      };
    }
    if (blogPost.categories && blogPost.categories.length > 0) {
      articleNode.articleSection = blogPost.categories;
    }
    if (organization) {
      articleNode.publisher = { "@id": `${siteUrl}/#organization` };
    }
    // Author
    if (blogPost.authorName) {
      const personNode = {
        "@type": "Person",
        "@id": `${siteUrl}/#author`,
        name: blogPost.authorName,
      };
      if (blogPost.authorUrl) personNode.url = blogPost.authorUrl;
      graph.push(personNode);
      articleNode.author = { "@id": `${siteUrl}/#author` };
    }
    // If no explicit page node was pushed, add a lightweight WebPage as the
    // mainEntityOfPage container
    if (!page) {
      graph.push({
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: blogPost.title,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        inLanguage: locale,
      });
    }
    graph.push(articleNode);
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function slugToTitle(slug) {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
function hasOrganizationData(org) {
  return !!(
    org.name ||
    org.legal_name ||
    org.logo ||
    org.url ||
    org.email ||
    org.phone ||
    org.description
  );
}
