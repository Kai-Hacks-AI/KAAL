# C7 trial protocol

A fresh agent is given only `prompt.txt`: the text of the Skill, the eight situations of the key without their expected answers, and the answer format. It uses no tool and reads nothing else. Its reply is recorded unedited in `answers.json`. The answers are compared with the key by Cases T8 to T11. A difference is reported as a finding about the Skill or the key, and nothing is corrected silently.

The question about claims (`claimSupported`) is part of the protocol and not of the Skill. One run is recorded.
