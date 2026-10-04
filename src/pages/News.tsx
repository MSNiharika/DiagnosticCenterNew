import { Link, useParams } from "react-router-dom"
import { Blogs } from "../components/cards"
import { ButtonLink, Page, useTitle } from "../components/ui"
import { postBySlug, readMinutes } from "../data/news"

export function NewsArticle() {
  const { slug = "" } = useParams()
  const post = postBySlug(slug)
  useTitle(post?.title ?? "News")
  if (!post) {
    return (
      <Page>
        <h1>That note is not on the desk.</h1>
        <ButtonLink to="/">Home</ButtonLink>
      </Page>
    )
  }
  const minutes = readMinutes(post)
  const contents = [
    ...post.sections.map((section) => ({ id: section.id, title: section.title })),
    { id: "summary", title: "Summary" },
    { id: "faqs", title: "FAQs" },
  ]
  return (
    <Page>
      <article className="story">
        <p className="crumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>{post.tag}</span>
          <span aria-hidden="true">/</span>
          {post.title}
        </p>
        <h1>{post.title}</h1>
        <p className="story-by">
          <strong>Aurora Diagnostics</strong>
          <span>Last updated {post.date}</span>
          <span>{post.tag}</span>
          <span>{minutes} min read</span>
        </p>
        <img className="story-photo" src={post.image} alt="" />
        <div className="story-layout">
          <nav className="story-toc" aria-label="Table of contents">
            <p>Table of contents</p>
            {contents.map((item) => (
              <a key={item.id} href={`#${item.id}`}>{item.title}</a>
            ))}
          </nav>
          <div>
            {post.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {post.sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2>{section.title}</h2>
                {section.blocks.map((block) =>
                  block.kind === "p" ? (
                    <p key={block.text}>{block.text}</p>
                  ) : (
                    <ul key={block.items[0]}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </section>
            ))}
            <section id="summary">
              <h2>Summary</h2>
              <p>{post.summary}</p>
              <p>
                <Link className="solid" to={post.book.to}>{post.book.label}</Link>
              </p>
            </section>
            <section id="faqs">
              <h2>FAQs</h2>
              {post.faqs.map((item) => (
                <div key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </article>
      <Blogs except={post.slug} />
    </Page>
  )
}
