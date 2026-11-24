import SwiftUI
import WidgetKit

// Verse of the day. Everything is bundled, so it works offline and shares no data with the app.

struct WidgetVerse: Decodable {
    let s: Int
    let a: Int
    let name: String
    let ar: String
    let en: String

    var reference: String { "\(name) \(s):\(a)" }
    var url: URL { URL(string: "masteringquran://open/quran/\(s)/\(a)")! }

    static let all: [WidgetVerse] = {
        guard let file = Bundle.main.url(forResource: "verses", withExtension: "json"),
              let data = try? Data(contentsOf: file),
              let verses = try? JSONDecoder().decode([WidgetVerse].self, from: data) else { return [] }
        return verses
    }()

    static let fallback = WidgetVerse(s: 94, a: 6, name: "Ash-Sharh", ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا", en: "Indeed, with hardship [will be] ease.")

    /// The same verse for everyone on a given calendar day.
    static func on(_ date: Date) -> WidgetVerse {
        guard !all.isEmpty else { return fallback }
        var utc = Calendar(identifier: .gregorian)
        utc.timeZone = TimeZone(identifier: "UTC")!
        var gregorian = Calendar(identifier: .gregorian)
        gregorian.timeZone = Calendar.current.timeZone
        let local = gregorian.dateComponents([.year, .month, .day], from: date)
        let midnight = utc.date(from: local) ?? date
        let day = Int(midnight.timeIntervalSince1970 / 86_400)
        return all[((day % all.count) + all.count) % all.count]
    }
}

struct VerseEntry: TimelineEntry {
    let date: Date
    let verse: WidgetVerse
}

struct VerseProvider: TimelineProvider {
    func placeholder(in context: Context) -> VerseEntry { VerseEntry(date: Date(), verse: .fallback) }

    func getSnapshot(in context: Context, completion: @escaping (VerseEntry) -> Void) {
        completion(VerseEntry(date: Date(), verse: .on(Date())))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerseEntry>) -> Void) {
        let now = Date()
        let start = Calendar.current.startOfDay(for: now)
        var entries = [VerseEntry(date: now, verse: .on(now))]
        for offset in 1...6 {
            if let day = Calendar.current.date(byAdding: .day, value: offset, to: start) {
                entries.append(VerseEntry(date: day, verse: .on(day)))
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

private extension Color {
    static let mqTop = Color(red: 0.024, green: 0.373, blue: 0.275)
    static let mqBottom = Color(red: 0.008, green: 0.173, blue: 0.133)
    static let mqGold = Color(red: 0.984, green: 0.749, blue: 0.141)
}

private extension View {
    @ViewBuilder func widgetBackdrop<B: View>(_ background: B) -> some View {
        if #available(iOS 17.0, *) {
            containerBackground(for: .widget) { background }
        } else {
            padding().frame(maxWidth: .infinity, maxHeight: .infinity).background(background)
        }
    }
}

struct VerseWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: VerseEntry

    private var arabicSize: CGFloat {
        switch family {
        case .systemSmall: return 20
        case .systemMedium: return 22
        default: return 34
        }
    }

    var body: some View {
        switch family {
        case .accessoryInline:
            Text("Quran \(entry.verse.s):\(entry.verse.a)").widgetURL(entry.verse.url)
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 1) {
                Text(entry.verse.reference).font(.caption2.weight(.semibold)).widgetAccentable()
                Text(entry.verse.en).font(.caption2).lineLimit(3).minimumScaleFactor(0.7)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .widgetBackdrop(Color.clear)
            .widgetURL(entry.verse.url)
        default:
            homeScreen
        }
    }

    private var homeScreen: some View {
        VStack(alignment: .leading, spacing: family == .systemLarge ? 14 : 6) {
            Text(entry.verse.reference)
                .font(.caption.weight(.semibold))
                .foregroundColor(.mqGold)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(entry.verse.ar)
                .font(.custom("Amiri-Regular", size: arabicSize))
                .foregroundColor(.white)
                .multilineTextAlignment(.trailing)
                .environment(\.layoutDirection, .leftToRight)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                .minimumScaleFactor(0.45)
                .accessibilityLabel(Text(entry.verse.en))
            if family != .systemSmall {
                Text(entry.verse.en)
                    .font(family == .systemLarge ? .body : .footnote)
                    .foregroundColor(Color.white.opacity(0.92))
                    .minimumScaleFactor(0.6)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            if family == .systemLarge {
                HStack {
                    Text("Saheeh International").font(.caption2).foregroundColor(Color.white.opacity(0.65))
                    Spacer()
                    Link(destination: URL(string: "masteringquran://open/continue")!) {
                        Label("Continue reading", systemImage: "book.fill")
                            .font(.caption.weight(.semibold))
                            .lineLimit(1)
                            .fixedSize()
                            .foregroundColor(.mqBottom)
                            .padding(.horizontal, 12).padding(.vertical, 7)
                            .background(Capsule().fill(Color.mqGold))
                    }
                }
            }
        }
        .widgetBackdrop(LinearGradient(colors: [.mqTop, .mqBottom], startPoint: .topLeading, endPoint: .bottomTrailing))
        .widgetURL(entry.verse.url)
    }
}

@main
struct QuranWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VerseOfTheDay", provider: VerseProvider()) { VerseWidgetView(entry: $0) }
            .configurationDisplayName("Verse of the Day")
            .description("A verse of the Quran in Arabic and English, new each day.")
            .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular, .accessoryInline])
    }
}
