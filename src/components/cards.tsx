import { Link } from "react-router-dom"
import { testById } from "../data/catalog"
import type { Package, Test } from "../data/types"
import { posts, readMinutes } from "../data/news"
import { useStore } from "../context/Store"
import { inr } from "../lib/utils"

export function cut(price: number, mrp: number) {
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
}

export function PackageCard({ item }: { item: Package }) {
  const { addPackage } = useStore()
  const count = item.testIds.reduce((sum, id) => sum + (testById(id)?.params.length ?? 0), 0)
  const saved = cut(item.price, item.mrp)
  return (
    <article className="pack">
      <Link className="pack-title" to={`/packages/${item.id}`}>{item.name}</Link>
      <div className="pack-body">
        <div className="meta">
          <span>{count} parameters</span>
          <span>Reports in {item.tat}</span>
        </div>
        <p className="price-row">
          <strong>{inr(item.price)}</strong>
          <span className="was">{inr(item.mrp)}</span>
          {saved > 0 && <span className="off">{saved}% off</span>}
        </p>
        <div className="pack-actions">
          <Link className="ghost" to={`/packages/${item.id}`}>View details</Link>
          <button type="button" className="solid" onClick={() => addPackage(item.id)}>Add to cart</button>
        </div>
      </div>
    </article>
  )
}

export function TestCard({ test, blurb }: { test: Test; blurb?: string }) {
  const { addTest } = useStore()
  const saved = cut(test.price, test.mrp)
  return (
    <article className="test-card">
      <Link to={`/tests/${test.id}`}>{test.name}</Link>
      {blurb ? <p>{blurb}</p> : <p>Report in {test.tat}</p>}
      <p className="muted" style={{ margin: 0, fontSize: "0.82rem" }}>
        {test.code} · {test.tat}
        {test.fasting ? " · fasting" : ""}
        {test.home ? " · home visit" : " · centre only"}
      </p>
      <p className="price-row">
        <strong>{inr(test.price)}</strong>
        <span className="was">{inr(test.mrp)}</span>
        {saved > 0 && <span className="off">{saved}% off</span>}
      </p>
      <button type="button" className="solid" onClick={() => addTest(test.id)}>Add to cart</button>
    </article>
  )
}

export function MenuTest({ test }: { test: Test }) {
  const { addTest } = useStore()
  const count = test.params.length
  const saved = cut(test.price, test.mrp)
  return (
    <article className="pack">
      <Link className="pack-title" to={`/tests/${test.id}`}>{test.name}</Link>
      <div className="pack-body">
        <div className="meta">
          <span>{count === 1 ? "1 parameter" : `${count} parameters`}</span>
          <span>Reports in {test.tat}</span>
        </div>
        <p className="price-row">
          <strong>{inr(test.price)}</strong>
          {test.mrp > test.price && <span className="was">{inr(test.mrp)}</span>}
          {saved > 0 && <span className="off">{saved}% off</span>}
        </p>
        <div className="pack-actions">
          <Link className="ghost" to={`/tests/${test.id}`}>View details</Link>
          <button type="button" className="solid" onClick={() => addTest(test.id)}>Add to cart</button>
        </div>
      </div>
    </article>
  )
}

export function Blogs({ except }: { except?: string }) {
  const shown = posts.filter((post) => post.slug !== except)
  if (shown.length === 0) return null
  return (
    <section className="section blogs">
      <h2>Latest Blogs & News</h2>
      <p className="sub">Stay informed with our expert insights and updates.</p>
      <div className="pack-grid">
        {shown.map((post) => {
          const minutes = readMinutes(post)
          return (
            <Link key={post.slug} to={`/news/${post.slug}`} className="card blog">
              <span className="blog-art">
                <img src={post.image} alt="" />
                <em>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 8.5V12l2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  {minutes} min read
                </em>
              </span>
              <span className="blog-body">
                <h2>{post.title}</h2>
                <p className="muted">{post.excerpt}</p>
                <span className="blog-foot">
                  <span>{post.date}</span>
                  <span className="more">Read more <span aria-hidden="true">→</span></span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
