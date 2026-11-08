// A headline whose lines rise one after another out of their own masks, once it scrolls into view.
// A line can be a string, or an array of strings and { em } pieces, set in italic.
const piece = (p, i) => (typeof p === 'string' ? p : <em key={i}>{p.em}</em>)
const plain = (line) => (typeof line === 'string' ? line : line.map((p) => (typeof p === 'string' ? p : p.em)).join(''))

const Lines = ({ as: Tag = 'h2', lines, className = '', delay = 0, ...rest }) => (
  <Tag data-reveal aria-label={lines.map(plain).join(' ')} className={className} style={{ '--delay': `${delay}ms` }} {...rest}>
    {lines.map((line, i) => (
      <span key={i} aria-hidden="true" className="line-mask" style={{ '--i': i }}>
        <span>{typeof line === 'string' ? line : line.map(piece)}</span>
      </span>
    ))}
  </Tag>
)

export default Lines
