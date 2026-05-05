from pathlib import Path

path = Path('frontend/src/app/oracle/page.tsx')
text = path.read_text(encoding='utf-8')

broken = (
    '                      <div className="flex items-center gap-3 mb-3">\n'
    '                        <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />\\n'
    '                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">AI Oracle Top Signal</span>\\n'
    '                      </div>\\n'
    '                      <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">{xlink.symbol} — ${xlink.currentPrice.toFixed(2)}</h3>\\n'
    '                      <p className="text-base text-emerald-50 max-w-xl mb-4">{xlink.symbol} shows exceptional bullish momentum with {xlink.confidence}% model confidence. Predicted price: ${xlink.predictedPrice.toFixed(2)} in {xlink.horizon}.</p>\\n'
    '                      <div className="flex flex-wrap gap-3">\\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\\n'
    '                          <p className="text-xs text-xc-muted">Signal</p>\\n'
    '                          <p className="font-black text-emerald-400">{xlink.signal}</p>\\n'
    '                        </div>\\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\\n'
    '                          <p className="text-xs text-xc-muted">Expected Return</p>\\n'
    '                          <p className="font-black text-emerald-400">+{xlink.expectedReturn.toFixed(1)}%</p>\\n'
    '                        </div>\\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\\n'
    '                          <p className="text-xs text-xc-muted">Confidence</p>\\n'
    '                          <p className="font-black text-emerald-400">{xlink.confidence}%</p>\\n'
    '                        </div>\\n'
    '                      </div>\\n'
    '                    </div>'
)

fixed = (
    '                      <div className="flex items-center gap-3 mb-3">\n'
    '                        <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />\n'
    '                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">\n'
    '                          AI Oracle Top Signal\n'
    '                        </span>\n'
    '                      </div>\n'
    '                      <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">\n'
    '                        {xlink.symbol} — ${xlink.currentPrice.toFixed(2)}\n'
    '                      </h3>\n'
    '                      <p className="text-base text-emerald-50 max-w-xl mb-4">\n'
    '                        {xlink.symbol} shows exceptional bullish momentum with {xlink.confidence}% model confidence. Predicted price: ${xlink.predictedPrice.toFixed(2)} in {xlink.horizon}.\n'
    '                      </p>\n'
    '                      <div className="flex flex-wrap gap-3">\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\n'
    '                          <p className="text-xs text-xc-muted">Signal</p>\n'
    '                          <p className="font-black text-emerald-400">{xlink.signal}</p>\n'
    '                        </div>\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\n'
    '                          <p className="text-xs text-xc-muted">Expected Return</p>\n'
    '                          <p className="font-black text-emerald-400">+{xlink.expectedReturn.toFixed(1)}%</p>\n'
    '                        </div>\n'
    '                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-2">\n'
    '                          <p className="text-xs text-xc-muted">Confidence</p>\n'
    '                          <p className="font-black text-emerald-400">{xlink.confidence}%</p>\n'
    '                        </div>\n'
    '                      </div>\n'
    '                    </div>'
)

if broken not in text:
    raise SystemExit('Broken block not found')

text = text.replace(broken, fixed)
path.write_text(text, encoding='utf-8')
print('replaced')
