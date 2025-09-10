import { useEffect, useState } from "react";
import { calendarAPI } from "../../services/api";
import { MemoItem } from "../../types";

interface DiaryMemoProps {
  year: number;
  month: number;
  week: number; // ← 주차
}

export default function DiaryMemoCell({ year, month, week }: DiaryMemoProps) {
  const [memo, setMemo] = useState<MemoItem | null>(null);
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // ✅ 초기 메모 불러오기
  useEffect(() => {
    const fetchMemo = async () => {
      try {
        const memos = await calendarAPI.getMonthlyMemos(year, month, "다이어리");
        const target = memos.find((m) => m.week === week);
        if (target) {
          setMemo(target);
          setContent(target.content);
        }
      } catch (err) {
        console.error("메모 불러오기 실패:", err);
      }
    };
    fetchMemo();
  }, [year, month, week]);

  // ✅ blur 시 저장 처리
  const handleBlur = async () => {
    try {
      if (!content.trim()) return;

      if (memo) {
        // 이미 메모 있음 → 수정
        const updated = await calendarAPI.updateMemo({
          id: memo.id,
          content,
          type: "다이어리",
        });
        setMemo(updated);
      } else {
        // 새 메모 등록
        const created = await calendarAPI.createMemo({
          year,
          week,
          type: "다이어리",
          content,
        });
        setMemo(created);
      }
    } catch (err) {
      console.error("메모 저장 실패:", err);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div
      className="diary-memo-cell"
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <span className="diary-memo-text">
          {content || "메모를 입력하세요..."}
        </span>
      )}
    </div>
  );
}