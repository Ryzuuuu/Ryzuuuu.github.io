// A headline that rises line by line out of a mask once it scrolls into view.
// `lines` is an array of strings or nodes; each one is a line on wide screens.
const Lines = ({ as: Tag = 'h2', lines, className = '', delay = 0, ...rest }) => (
  <Tag data-reveal className={className} style={{ '--delay': `${delay}ms` }} {...rest}>
    {lines.map((line, i) => (
      <span key={i} className="line-mask" style={{ '--i': i }}>
        <span>{line}</span>
      </span>
    ))}
  </Tag>
)

export default Lines
