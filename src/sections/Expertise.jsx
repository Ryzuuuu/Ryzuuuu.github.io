import SectionHeading from '../components/SectionHeading'
import { loadout } from '../constants'

const ROMAN = ['i', 'ii', 'iii', 'iv']

const Expertise = () => (
  <section id="expertise" data-chapter="expertise" data-shot="expertise" className="relative">
    <div className="container-x grid min-h-[130vh] items-center pb-24 pt-[52svh] lg:grid-cols-12 lg:py-32">
      <div className="panel lg:col-span-6 xl:col-span-5">
        <SectionHeading
          numeral="II"
          eyebrow="Expertise"
          title={
            <>
              The instruments <em>I&nbsp;reach for.</em>
            </>
          }
          intro="A working kit for things that have to see, listen and sense, then ship somewhere real."
        />

        <ol className="border-t border-hairline">
          {loadout.map(({ group, items }, i) => (
            <li
              key={group}
              className="reveal grid grid-cols-[2.75rem_1fr] border-b border-hairline py-6"
              style={{ '--delay': `${i * 90}ms` }}
            >
              <span className="numeral pt-1">{ROMAN[i]}.</span>
              <div>
                <h3 className="text-[1.9rem] leading-tight">{group}</h3>
                <p className="mt-2 leading-relaxed text-parchment">{items.join(' · ')}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
)

export default Expertise
