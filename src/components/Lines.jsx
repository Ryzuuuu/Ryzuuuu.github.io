// A headline whose letters rise out of a mask, line by line, once it scrolls into view.
// useLiveType then lets the same letters respond to the pointer.
const Lines = ({ as: Tag = 'h2', lines, className = '', delay = 0, ...rest }) => (
  <Tag data-reveal aria-label={lines.join(' ')} className={className} style={{ '--delay': `${delay}ms` }} {...rest}>
    {lines.map((line, i) => {
      let c = 0
      return (
        <span key={i} aria-hidden="true" className="line-mask" style={{ '--i': i }}>
          <span>
            {line.split(' ').map((word, w) => (
              <span key={w}>
                {w > 0 && ' '}
                <span className="word">
                  {[...word].map((letter, l) => (
                    <span key={l} className="char" style={{ '--c': c++ }}>{letter}</span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        </span>
      )
    })}
  </Tag>
)

export default Lines
