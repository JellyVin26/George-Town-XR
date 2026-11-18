# George Town XR — Nielsen’s 10 usability heuristics
ITS63504 Human Computer Interaction · Implemented UI evidence

| # | Heuristic | Implemented interface behaviour |
|---|---|---|
| 1 | Visibility of system status | Mode/language/stop context; marker and tracking states; trail completion/current/next labels; saved status; live rotation and zoom values; Play/Pause state. |
| 2 | Match between system and the real world | Familiar heritage terms, named physical details, explicit teaching-illustration labels, site-specific schematic viewpoint navigation, explicit Inspect → Answer → Continue sequence. |
| 3 | User control and freedom | Back to Explore, Save & leave, resumable trail, reset model, cancel restart, undo restart, native Escape-to-close dialogs. |
| 4 | Consistency and standards | Shared header/help/back/footer positions, consistent primary/secondary actions, selected-state accessibility attributes, explicit Play/Pause and Zoom labels. |
| 5 | Error prevention | Continue disabled until a correct answer; evidence required before answers appear; bounded zoom with disabled end controls; restart confirmation prevents accidental progress loss. |
| 6 | Recognition rather than recall | Stop names remain visible; labelled artifact hotspot alternatives; completed/current/next trail labels; selected language, stop and mode remembered; current evidence/answer restored after reload. |
| 7 | Flexibility and efficiency of use | Direct experience entry, My trail shortcut, camera-free comparison/viewer, Remote trail, drag or directional tour controls, audio or transcript. |
| 8 | Aesthetic and minimalist design | Existing cream/teal/terracotta identity retained; compact context bar; reduced Explore image height; detailed instructions available on demand rather than repeated large panels. |
| 9 | Help users recognise, diagnose and recover from errors | Tracking-lost explanation plus Retry and Compare photos; explanatory wrong-answer feedback without penalty; storage-write failure notice advises keeping the tab open. |
| 10 | Help and documentation | Persistent Help button opens screen-specific, bilingual task instructions; keyboard guidance; story attribution and prototype limitations remain available. |

## Verification
Browser checks covered contextual Help, restart/undo, saved answers, zoom limits, and named hotspot alternatives.

This is a heuristic-informed implementation, not a claim of user-tested usability or formal accessibility conformance. A next evaluation should involve representative visitors, including Bahasa Melayu speakers and assistive-technology users.
