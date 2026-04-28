export default function BackgroundPaperShaders() {
  return (
    <div className="background-video-wrap" aria-hidden="true">
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/backgroundUI.mp4" type="video/mp4" />
      </video>
      <div className="background-video-overlay" />
    </div>
  )
}
