export default function FlyingSymbols({ symbols }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {symbols.map((item) => (
        <div
          key={item.id}
          className="flying-symbol absolute"
          style={{
            left: `${item.left}%`,
            bottom: '0px',
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            fontSize: `${item.size}px`,
            opacity: 0,
          }}
        >
          {item.symbol.type === 'emoji' ? (
            <span>{item.symbol.char}</span>
          ) : (
            <img
              src={item.symbol.src}
              alt=""
              style={{ width: item.size, height: item.size, objectFit: 'contain' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
