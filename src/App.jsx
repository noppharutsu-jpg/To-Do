import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Check,
  ClipboardList,
  Search,
  X,
  CalendarDays,
  Briefcase,
  User,
  ShoppingBag,
  HeartPulse,
  LayoutGrid,
} from "lucide-react";

const PRIORITIES = {
  low: {
    label: "ต่ำ",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-400",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "กลาง",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-400",
    dot: "bg-amber-500",
  },
  high: {
    label: "สูง",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
};
const ORDER = ["low", "medium", "high"];

const CATS = {
  work: { label: "งาน", icon: Briefcase, chip: "bg-sky-50 text-sky-700" },
  personal: {
    label: "ส่วนตัว",
    icon: User,
    chip: "bg-violet-50 text-violet-700",
  },
  shopping: {
    label: "ช้อปปิ้ง",
    icon: ShoppingBag,
    chip: "bg-orange-50 text-orange-700",
  },
  health: {
    label: "สุขภาพ",
    icon: HeartPulse,
    chip: "bg-teal-50 text-teal-700",
  },
};
const CAT_KEYS = Object.keys(CATS);

const FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "active", label: "ยังไม่เสร็จ" },
  { id: "done", label: "เสร็จแล้ว" },
];

const EMPTY = {
  all: "ยังไม่มีงาน เริ่มเพิ่มงานแรกของคุณได้เลย",
  active: "ไม่มีงานที่ค้างอยู่ เยี่ยมมาก!",
  done: "ยังไม่มีงานที่ทำเสร็จ",
};

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const fmtDate = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });

function dueInfo(todo, today) {
  if (!todo.due) return null;
  const f = fmtDate(todo.due);
  if (todo.done) return { cls: "bg-slate-100 text-slate-400", text: f };
  if (todo.due < today)
    return { cls: "bg-rose-100 text-rose-700", text: `เลยกำหนด ${f}` };
  if (todo.due === today)
    return { cls: "bg-yellow-100 text-yellow-800", text: "วันนี้" };
  return { cls: "bg-slate-100 text-slate-600", text: f };
}

let nextId = 6;

function Donut({ segments, total, percent }) {
  const r = 40;
  const C = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
        />
        {segments.map((s) => {
          const len = total ? (s.value / total) * C : 0;
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off}
              style={{ transition: "all 400ms ease" }}
            />
          );
          off += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">
        {percent}%
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  today,
  removing,
  onToggle,
  onDelete,
  onEdit,
  onCycle,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];
  const c = CATS[todo.cat];
  const Icon = c.icon;
  const due = dueInfo(todo, today);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    const t = draft.trim();
    if (t) onEdit(todo.id, t);
    else setDraft(todo.text);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(todo.text);
    setEditing(false);
  };

  return (
    <li
      style={{
        maxHeight: removing ? 0 : 160,
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(24px) scale(0.96)" : "none",
        marginBottom: removing ? 0 : 10,
        transition: "all 280ms ease",
      }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-100 pr-3 overflow-hidden">
        <span className={`self-stretch w-1.5 shrink-0 ${p.bar}`} />

        <button
          onClick={() => onToggle(todo.id)}
          aria-label={
            todo.done
              ? "ทำเครื่องหมายว่ายังไม่เสร็จ"
              : "ทำเครื่องหมายว่าเสร็จแล้ว"
          }
          className={`w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
            todo.done
              ? "bg-slate-800 border-slate-800"
              : "border-slate-300 hover:border-slate-500"
          }`}
        >
          {todo.done && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </button>

        <div className="flex-1 min-w-0 py-3">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="w-full px-2 py-1 -my-1 rounded-md border border-slate-300 outline-none focus:border-slate-500 text-slate-800"
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className={`block break-words cursor-text select-none transition-colors ${
                todo.done ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {todo.text}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${c.chip}`}
            >
              <Icon size={12} />
              {c.label}
            </span>
            {due && (
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${due.cls}`}
              >
                <CalendarDays size={12} />
                {due.text}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onCycle(todo.id)}
          title="คลิกเพื่อเปลี่ยนความสำคัญ"
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${p.badge}`}
        >
          {p.label}
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          aria-label="ลบงาน"
          className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}

export default function TodoApp() {
  const [todos, setTodos] = useState(() => [
    {
      id: 1,
      text: "ส่งรายงานโปรเจกต์",
      done: false,
      priority: "high",
      cat: "work",
      due: addDays(-1),
    },
    {
      id: 2,
      text: "ซื้อของเข้าบ้าน",
      done: false,
      priority: "low",
      cat: "shopping",
      due: addDays(0),
    },
    {
      id: 3,
      text: "ออกกำลังกายตอนเย็น",
      done: true,
      priority: "medium",
      cat: "health",
      due: addDays(0),
    },
    {
      id: 4,
      text: "โทรหาที่บ้าน",
      done: false,
      priority: "medium",
      cat: "personal",
      due: addDays(3),
    },
    {
      id: 5,
      text: "เตรียมสไลด์ประชุมทีม",
      done: false,
      priority: "high",
      cat: "work",
      due: "",
    },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [cat, setCat] = useState("work");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState([]);

  const today = iso(new Date());

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [
      { id: nextId++, text: t, done: false, priority, cat, due },
      ...prev,
    ]);
    setText("");
    setDue("");
  };

  const toggle = (id) =>
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const edit = (id, newText) =>
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const cycle = (id) =>
    setTodos((p) =>
      p.map((t) =>
        t.id === id
          ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] }
          : t,
      ),
    );

  const remove = (ids) => {
    setRemoving((r) => [...r, ...ids]);
    setTimeout(() => {
      setTodos((p) => p.filter((t) => !ids.includes(t.id)));
      setRemoving((r) => r.filter((x) => !ids.includes(x)));
    }, 280);
  };

  // stats (always over all todos)
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const remaining = total - doneCount;
  const overdue = todos.filter((t) => !t.done && t.due && t.due < today).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const segments = [
    { label: "เสร็จแล้ว", value: doneCount, color: "#10b981" },
    { label: "กำลังทำ", value: remaining - overdue, color: "#64748b" },
    { label: "เลยกำหนด", value: overdue, color: "#f43f5e" },
  ];

  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "all" ? true : filter === "active" ? !t.done : t.done) &&
      (catFilter === "all" || t.cat === catFilter) &&
      (!q || t.text.toLowerCase().includes(q)),
  );
  const filtered = q || catFilter !== "all";

  const catItems = [
    { id: "all", label: "ทั้งหมด", icon: LayoutGrid, count: total },
    ...CAT_KEYS.map((k) => ({
      id: k,
      label: CATS[k].label,
      icon: CATS[k].icon,
      count: todos.filter((t) => t.cat === k).length,
    })),
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12"
      style={{
        fontFamily:
          "'Noto Sans Thai', 'Sarabun', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            รายการงานของฉัน
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            จดสิ่งที่ต้องทำ แล้วค่อย ๆ ติ๊กออกทีละอย่าง
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-[14rem_1fr] md:grid-rows-[auto_1fr]">
          {/* Category sidebar */}
          <nav className="md:col-start-1 md:row-start-1 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
            {catItems.map((c) => {
              const Icon = c.icon;
              const active = catFilter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left whitespace-nowrap">
                    {c.label}
                  </span>
                  <span
                    className={`text-xs px-1.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}
                  >
                    {c.count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Main column */}
          <main className="md:col-start-2 md:row-start-1 md:row-span-2 min-w-0">
            {/* Add form */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-4">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="เพิ่มงานใหม่..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-400 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                <button
                  onClick={add}
                  disabled={!text.trim()}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">เพิ่ม</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-500 mr-1">ความสำคัญ</span>
                  {ORDER.map((k) => (
                    <button
                      key={k}
                      onClick={() => setPriority(k)}
                      className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ring-1 ring-inset transition-colors ${
                        priority === k
                          ? PRIORITIES[k].badge + " font-medium"
                          : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${PRIORITIES[k].dot}`}
                      />
                      {PRIORITIES[k].label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm text-slate-500 mr-1">หมวดหมู่</span>
                  {CAT_KEYS.map((k) => {
                    const Icon = CATS[k].icon;
                    return (
                      <button
                        key={k}
                        onClick={() => setCat(k)}
                        className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ring-1 ring-inset transition-colors ${
                          cat === k
                            ? CATS[k].chip + " ring-current font-medium"
                            : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={13} />
                        {CATS[k].label}
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  กำหนดส่ง
                  <input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-slate-400 text-slate-700 text-sm"
                  />
                </label>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหางาน..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 p-1 bg-slate-200/60 rounded-xl mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                    filter === f.id
                      ? "bg-white shadow-sm text-slate-900 font-medium"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            {visible.length === 0 ? (
              <div className="flex flex-col items-center text-center py-12 text-slate-400">
                <ClipboardList size={40} strokeWidth={1.5} />
                <p className="mt-3 text-sm">
                  {filtered ? "ไม่พบงานที่ตรงกับตัวกรอง" : EMPTY[filter]}
                </p>
              </div>
            ) : (
              <ul>
                {visible.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    today={today}
                    removing={removing.includes(t.id)}
                    onToggle={toggle}
                    onDelete={(id) => remove([id])}
                    onEdit={edit}
                    onCycle={cycle}
                  />
                ))}
              </ul>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <span>เหลืออีก {remaining} งาน</span>
              <button
                onClick={() =>
                  remove(todos.filter((t) => t.done).map((t) => t.id))
                }
                disabled={doneCount === 0}
                className="px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors"
              >
                ล้างที่เสร็จแล้ว{doneCount > 0 ? ` (${doneCount})` : ""}
              </button>
            </div>
          </main>

          {/* Stats */}
          <section className="md:col-start-1 md:row-start-2 md:self-start bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <h2 className="text-sm font-medium text-slate-700 mb-3">สถิติ</h2>
            <div className="flex items-center gap-4">
              <Donut segments={segments} total={total} percent={percent} />
              <div className="flex-1 min-w-0 space-y-1.5 text-sm">
                {segments.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="flex-1">{s.label}</span>
                    <span className="font-medium text-slate-800">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
              ทั้งหมด {total} งาน ทำเสร็จแล้ว {percent}%
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
