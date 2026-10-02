import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Check, ClipboardList } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-400", dot: "bg-emerald-500" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 ring-amber-200", bar: "bg-amber-400", dot: "bg-amber-500" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 ring-rose-200", bar: "bg-rose-500", dot: "bg-rose-500" },
};
const ORDER = ["low", "medium", "high"];

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

let nextId = 4;

function TodoItem({ todo, removing, onToggle, onDelete, onEdit, onCycle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];

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
        maxHeight: removing ? 0 : 140,
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
          aria-label={todo.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
          className={`w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
            todo.done ? "bg-slate-800 border-slate-800" : "border-slate-300 hover:border-slate-500"
          }`}
        >
          {todo.done && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0 py-3.5">
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
  const [todos, setTodos] = useState([
    { id: 1, text: "ส่งรายงานโปรเจกต์", done: false, priority: "high" },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "low" },
    { id: 3, text: "ออกกำลังกายตอนเย็น", done: true, priority: "medium" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [removing, setRemoving] = useState([]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTodos((prev) => [{ id: nextId++, text: t, done: false, priority }, ...prev]);
    setText("");
  };

  const toggle = (id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const edit = (id, newText) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const cycle = (id) =>
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    );

  const remove = (ids) => {
    setRemoving((r) => [...r, ...ids]);
    setTimeout(() => {
      setTodos((p) => p.filter((t) => !ids.includes(t.id)));
      setRemoving((r) => r.filter((x) => !ids.includes(x)));
    }, 280);
  };

  const remaining = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - remaining;
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 py-8 sm:py-14"
      style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', system-ui, -apple-system, sans-serif" }}
    >
      <div className="max-w-xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">รายการงานของฉัน</h1>
          <p className="text-slate-500 mt-1 text-sm">จดสิ่งที่ต้องทำ แล้วค่อย ๆ ติ๊กออกทีละอย่าง</p>
        </header>

        {/* Add form */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-4 mb-5">
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

          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-slate-500 mr-1">ความสำคัญ</span>
            {ORDER.map((k) => (
              <button
                key={k}
                onClick={() => setPriority(k)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ring-1 ring-inset transition-colors ${
                  priority === k ? PRIORITIES[k].badge + " font-medium" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${PRIORITIES[k].dot}`} />
                {PRIORITIES[k].label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-slate-200/60 rounded-xl mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                filter === f.id ? "bg-white shadow-sm text-slate-900 font-medium" : "text-slate-500 hover:text-slate-700"
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
            <p className="mt-3 text-sm">{EMPTY[filter]}</p>
          </div>
        ) : (
          <ul>
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
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
            onClick={() => remove(todos.filter((t) => t.done).map((t) => t.id))}
            disabled={doneCount === 0}
            className="px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            ล้างที่เสร็จแล้ว{doneCount > 0 ? ` (${doneCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
