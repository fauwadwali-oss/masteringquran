import UIKit
import Capacitor
import EventKit

// The storyboard's view controller: registers plugins that live in the app itself.
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleSignInPlugin())
        bridge?.registerPluginInstance(CalendarAddPlugin())
    }
}

// Adds prayer times to the calendar. On iOS 17 and later the app can only add events, not read any.
@objc(CalendarAddPlugin)
class CalendarAddPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "CalendarAddPlugin"
    let jsName = "CalendarAdd"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "add", returnType: CAPPluginReturnPromise)]

    private let store = EKEventStore()

    @objc func add(_ call: CAPPluginCall) {
        let done: (Bool, Error?) -> Void = { granted, _ in
            guard granted else {
                call.reject("No access to the calendar", "denied")
                return
            }
            DispatchQueue.main.async { self.save(call) }
        }
        if #available(iOS 17.0, *) {
            store.requestWriteOnlyAccessToEvents(completion: done)
        } else {
            store.requestAccess(to: .event, completion: done)
        }
    }

    private func save(_ call: CAPPluginCall) {
        // The store was made before access was given.
        store.reset()
        guard let calendar = store.defaultCalendarForNewEvents else {
            call.reject("No calendar", "failed")
            return
        }
        do {
            var added = 0
            for item in call.getArray("events", JSObject.self) ?? [] {
                guard let title = item["title"] as? String, let start = item["start"] as? Double ?? (item["start"] as? Int).map(Double.init) else { continue }
                let event = EKEvent(eventStore: store)
                event.calendar = calendar
                event.title = title
                event.notes = item["notes"] as? String
                event.startDate = Date(timeIntervalSince1970: start / 1000)
                event.endDate = event.startDate.addingTimeInterval(15 * 60)
                event.availability = .free
                event.addAlarm(EKAlarm(relativeOffset: 0))
                try store.save(event, span: .thisEvent, commit: false)
                added += 1
            }
            try store.commit()
            call.resolve(["added": added])
        } catch {
            store.reset()
            call.reject("Could not add the events", "failed")
        }
    }
}
