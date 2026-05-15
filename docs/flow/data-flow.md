# Project Flow — Báo cáo tiến độ Kangnam

<!-- Last updated: 2026-05-15 -->

---

## 1. Script Load Order

```mermaid
flowchart LR
    A["seed.js\nwindow.SEED_DATA"] --> B["config.js\nwindow.CLOUD_CONFIG"]
    B --> C["storage.js\nStore object"]
    C --> D["app.js\nall UI + logic"]

    style A fill:#f5f0e8,stroke:#c9a84c
    style B fill:#f5f0e8,stroke:#c9a84c
    style C fill:#f5f0e8,stroke:#c9a84c
    style D fill:#e8f0f5,stroke:#4c84c9
```

> Load order từ `index.html:96-97`. Thứ tự bắt buộc — `app.js` gọi `Store.load()` ngay khi parse, trước `DOMContentLoaded`.

---

## 2. Khởi động (Init Sequence)

```mermaid
sequenceDiagram
    participant HTML as index.html
    participant Seed as seed.js
    participant Cfg as config.js
    participant Store as storage.js
    participant App as app.js
    participant GAS as Apps Script
    participant Sheet as Google Sheet B2

    HTML->>Seed: parse → window.SEED_DATA
    HTML->>Cfg: parse → window.CLOUD_CONFIG
    HTML->>Store: parse → Store object
    HTML->>App: parse → define all functions

    Note over App: top-level (before DOMContentLoaded)
    App->>Store: data = Store.load()
    Note over App: data = structuredClone(SEED_DATA)

    Note over App: DOMContentLoaded fires
    App->>App: bind all event listeners
    App->>App: render() ← seed data, immediate
    App->>App: cloudOK() check

    alt cloud configured
        App->>GAS: pullCloud(silent=true)\n<script src="?token=X&callback=jsonp_abc">
        GAS->>Sheet: getRange("B2").getValue()
        Sheet-->>GAS: JSON string
        GAS-->>App: window.jsonp_abc({ok, data})
        App->>App: data = j.data
        App->>App: render() ← cloud data replaces seed
    else cloud not configured
        App->>App: stay on seed data
    end
```

---

## 3. Điều hướng trang

```mermaid
stateDiagram-v2
    [*] --> dashboard : init

    dashboard --> projects : nav click
    dashboard --> tasks : nav click
    dashboard --> kanban : nav click
    dashboard --> members : nav click
    dashboard --> calendar : nav click

    projects --> dashboard : nav click
    tasks --> dashboard : nav click
    kanban --> dashboard : nav click
    members --> dashboard : nav click
    calendar --> dashboard : nav click

    projects --> tasks : nav click
    tasks --> kanban : nav click
    kanban --> projects : nav click

    note right of dashboard
        setPage(p)
        toggle .active on .page divs
        toggle .active on nav buttons
        render() called every page switch
        sidebar auto-close on mobile (< 940px)
    end note
```

---

## 4. Luồng CRUD

```mermaid
flowchart TD
    subgraph CREATE ["➕ Tạo mới"]
        C1["Click nút\n#addProject / #addTask / #addMember\n#heroProject / #heroTask / #quickAdd"]
        C2["openProject() / openTask() / openModal('memberModal')"]
        C3["Điền form"]
        C4["Submit → saveProject / saveTask / saveMember"]
        C5["id() tạo ID mới\ncode() tạo mã DA001/CV001"]
        C6["data.xxx = [newItem, ...data.xxx]"]
        C7["persist(msg)"]

        C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7
    end

    subgraph UPDATE ["✎ Sửa"]
        U1["Click nút ✎\nopenProject(id) / openTask(id)"]
        U2["Populate form với data hiện tại"]
        U3["Submit → saveProject / saveTask"]
        U4["data.xxx = data.xxx.map(x => x.id === id ? updated : x)"]
        U5["updateProject(projectId)\ntính lại progress từ tasks"]
        U6["persist(msg)"]

        U1 --> U2 --> U3 --> U4 --> U5 --> U6
    end

    subgraph DELETE ["⌫ Xóa"]
        D1["Click nút ⌫\ndelProject / delTask / delMember"]
        D2["confirm() dialog"]
        D3["data.xxx = data.xxx.filter(x => x.id !== id)"]
        D4{"Xóa project?"}
        D5["Xóa cascade tasks\ndata.tasks.filter(t => t.projectId !== pid)"]
        D6["Reassign nếu xóa member\nassigneeId / leaderId → next member"]
        D7["persist(msg)"]

        D1 --> D2 --> D3 --> D4
        D4 -->|yes| D5 --> D7
        D4 -->|no - task/member| D6 --> D7
    end
```

---

## 5. Pipeline persist()

```mermaid
flowchart TD
    A["persist(msg, skip=false)"]

    A --> B["activity(msg)\ndata.activities.unshift({id, text, time})\nslice to 120"]
    A --> C["Store.save(data)\n⚠ NOOP — không lưu browser"]
    A --> D["render()\nvẽ lại toàn bộ UI"]
    A --> E["toast(msg)\nshowTimeout 2400ms"]
    A --> F{"skip === false?"}

    F -->|yes| G["debouncedPush()\nclearTimeout + setTimeout 700ms"]
    F -->|no| Z["kết thúc"]

    G --> H{"cloudOK()?"}
    H -->|scriptUrl + token hợp lệ| I["pushCloud(silent=true)"]
    H -->|chưa cấu hình| Z

    I --> J["fetch(scriptUrl, POST, no-cors)\nbody = {token, data + updatedAt}"]
    J --> K["Apps Script doPost\nSheet B2 = JSON.stringify(data)"]
    K --> L["cloudStatus() update UI pill"]
```

---

## 6. Cloud Sync hiện tại — Google Sheets

```mermaid
sequenceDiagram
    participant App as app.js
    participant DOM as DOM head
    participant GAS as Apps Script Web App
    participant Sheet as Sheet DATA!B2

    rect rgb(255, 245, 230)
        Note over App,Sheet: PULL (đọc dữ liệu)
        App->>DOM: append <script src="URL?token=X&callback=jsonp_abc&mode=json">
        DOM->>GAS: GET doGet(e)
        GAS->>GAS: verify token
        GAS->>Sheet: getRange("B2").getValue()
        Sheet-->>GAS: JSON string
        GAS-->>DOM: text/javascript: jsonp_abc({ok:true, data:{...}, updatedAt:"..."})
        DOM-->>App: execute → window.jsonp_abc() callback
        App->>App: data = j.data; render()
        App->>DOM: cleanup — remove <script>, delete window.jsonp_abc
    end

    rect rgb(230, 245, 255)
        Note over App,Sheet: PUSH (ghi dữ liệu)
        App->>GAS: fetch(url, {method:POST, mode:no-cors, body:JSON.stringify({token, data})})
        Note over App: Response là opaque — không đọc được status
        GAS->>GAS: verify token == SECRET
        GAS->>Sheet: getRange("B2").setValue(JSON.stringify(body.data))
        GAS->>Sheet: getRange("C2").setValue(timestamp)
        GAS-->>App: (opaque — bị no-cors block)
        App->>App: cloudStatus() — assume success
    end
```

---

## 7. Cloud Sync đích — Supabase

```mermaid
sequenceDiagram
    participant App as app.js
    participant SBClient as Supabase JS Client (CDN)
    participant SBEdge as Supabase Edge / PostgREST
    participant PG as PostgreSQL (4 tables)

    rect rgb(230, 255, 240)
        Note over App,PG: PULL — Store.pull()
        App->>SBClient: Promise.all([\n  from('members').select('*'),\n  from('projects').select('*'),\n  from('tasks').select('*'),\n  from('activities').select('*').order('time').limit(120)\n])
        SBClient->>SBEdge: GET /rest/v1/members?select=*\n(+ 3 parallel requests)
        SBEdge->>PG: SELECT * FROM members, projects, tasks, activities
        PG-->>SBEdge: rows JSON
        SBEdge-->>SBClient: 200 OK {data:[], error:null}
        SBClient-->>App: [{data, error}, ...]
        App->>App: data = {members, projects, tasks, activities}
        App->>App: render()
    end

    rect rgb(245, 230, 255)
        Note over App,PG: PUSH — Store.push(data) after debouncedPush
        App->>SBClient: Promise.all([\n  from('members').upsert(data.members),\n  from('projects').upsert(data.projects),\n  from('tasks').upsert(data.tasks),\n  from('activities').upsert(data.activities)\n])
        SBClient->>SBEdge: POST /rest/v1/members\nPrefer: resolution=merge-duplicates
        SBEdge->>PG: INSERT ... ON CONFLICT (id) DO UPDATE
        PG-->>SBEdge: 201 Created / 200 OK
        SBEdge-->>SBClient: {data, error:null}
        SBClient-->>App: settled
        App->>App: cloudStatus('online')
    end
```

---

## 8. Render Pipeline

```mermaid
flowchart LR
    A["render()"] --> B["opts()\npopulate <select> dropdowns"]
    A --> C["stat()\n#stats cards\n#ring progress circle"]
    A --> D["chart()\nworkload bar chart per member"]
    A --> E["progress()\nproject progress list"]
    A --> F["dues()\noverdue + soon tasks"]
    A --> G["projectTable()\nfiltered table"]
    A --> H["taskTable()\nfiltered table"]
    A --> I["kanban()\n4 columns by status"]
    A --> J["members()\nmember cards"]
    A --> K["calendar()\n14-day deadline view"]
    A --> L["activityList()\ntimeline 28 items"]
    A --> M["cloudStatus()\nsync pill indicator"]

    style A fill:#e8f0f5,stroke:#4c84c9,font-weight:bold
```

> `render()` vẽ lại **toàn bộ** UI mỗi lần gọi — không có virtual DOM, không có dirty check. Chi phí thấp vì data nhỏ.

---

## 9. Data Model (ER)

```mermaid
erDiagram
    members {
        text id PK "prefix 'm' + base36"
        text name
        text role "default: Thành viên"
    }

    projects {
        text id PK "prefix 'p' + base36"
        text code "DA001, DA002..."
        text name
        text description
        text status "planning|todo|doing|review|done"
        text priority "low|medium|high"
        numeric budget "VND"
        date start "ISO YYYY-MM-DD"
        date end "ISO YYYY-MM-DD"
        text leader_id FK
        int progress "0-100, auto-calc từ tasks"
    }

    tasks {
        text id PK "prefix 't' + base36"
        text code "CV001, CV002..."
        text title
        text description
        text project_id FK
        text assignee_id FK
        text status "planning|todo|doing|review|done"
        text priority "low|medium|high"
        date start
        date due
        text[] tags
    }

    activities {
        text id PK "prefix 'a' + base36"
        text text "Vietnamese past-tense log"
        timestamptz time "ISO string"
    }

    members ||--o{ projects : "leader_id"
    members ||--o{ tasks : "assignee_id"
    projects ||--o{ tasks : "project_id (cascade delete)"
```

---

## 10. Progress Auto-Calculation

```mermaid
flowchart TD
    A["saveTask / delTask\ngọi updateProject(projectId)"]
    B["Lấy tất cả tasks của project"]
    C{"tasks.length === 0?"}
    D["return — không tính"]
    E["Tính score:\ndone = 1.0\nreview = 0.72\ndoing = 0.45\nplanning/todo = 0"]
    F["progress = round(score / total * 100)"]
    G{"progress === 100?"}
    H["project.status = 'done'"]
    I{"progress > 0 &&\nstatus === 'planning'?"}
    J["project.status = 'doing'"]
    K{"status === 'done' &&\nprogress < 100?"}
    L["project.status = 'doing'"]
    M["persist() → render()"]

    A --> B --> C
    C -->|yes| D
    C -->|no| E --> F --> G
    G -->|yes| H --> M
    G -->|no| I
    I -->|yes| J --> M
    I -->|no| K
    K -->|yes| L --> M
    K -->|no| M
```

---

## 11. Import / Export

```mermaid
flowchart LR
    subgraph EXPORT
        E1["click #exportBtn"]
        E2["Store.export(data)"]
        E3["JSON.stringify(data, null, 2)"]
        E4["Blob → ObjectURL"]
        E5["<a download> click"]
        E6["bao-cao-tien-do-hoang-dieu-linh.json"]

        E1 --> E2 --> E3 --> E4 --> E5 --> E6
    end

    subgraph IMPORT
        I1["click #importBtn → trigger #jsonFile"]
        I2["FileReader.readAsText(file)"]
        I3["JSON.parse(result)"]
        I4{"validate:\nprojects && tasks && members?"}
        I5["data = parsed\nrender()\npersist('Đã nhập dữ liệu JSON')"]
        I6["alert('Không nhập được JSON')"]

        I1 --> I2 --> I3 --> I4
        I4 -->|valid| I5
        I4 -->|invalid| I6
    end
```
