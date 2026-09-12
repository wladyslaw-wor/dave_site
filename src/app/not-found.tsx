import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      {/* eslint-disable-next-line @next/next/no-img-element -- static asset, no need for next/image here */}
      <img className="not-found-image" src="/404-cancel-culture.png" alt="" />
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">Page not found</p>
      <Link href="/" className="not-found-link">
        Back home
      </Link>
    </div>
  );
}
