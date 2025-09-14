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
            if (memo) {
                // 기존 메모가 있을 때 → 수정 (빈 문자열도 포함)
                const updated = await calendarAPI.updateMemo({
                    id: memo.id,
                    content, // "" 혹은 문자열 그대로 전달
                    type: "다이어리",
                });
                setMemo(updated);
                setContent(content); 
            } else {
                // 기존 메모 없음 → 새로 등록
                if (content.trim()) {
                    const created = await calendarAPI.createMemo({
                    year,
                    week,
                    type: "다이어리",
                    content,
                    });
                    setMemo(created);
                }
                // memo 없음 + 공란이면 아무 일도 안 함
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