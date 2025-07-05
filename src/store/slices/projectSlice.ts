// 프로젝트 모드 관련 상태 관리

// Redux Toolkit의 slice 생성 함수 가져오기
import { createSlice } from '@reduxjs/toolkit';

// 프로젝트 관련 상태들의 타입 정의
interface ProjectState {
  projects: any[];   // 프로젝트 목록 (나중에 구체적으로 정의)
  selectedProject: any | null;  // 현재 선택된 프로젝트 (없으면 null)
}

// 시작할 때의 기본 상태
const initialState: ProjectState = {
  projects: [],  // 처음에는 프로젝트 없음
  selectedProject: null,  // 처음에는 선택된 프로젝트 없음
};

const projectSlice = createSlice({
    name: 'project',     // slice 이름
    initialState,        // 초기 상태
    reducers: {          // 상태 변경 함수들
      setSelectedProject: (state, action) => {
        state.selectedProject = action.payload; // 선택된 프로젝트 변경
      },
    },
  });

// 액션 함수를 다른 파일에서 사용할 수 있게 내보내기
export const { setSelectedProject } = projectSlice.actions;
// reducer를 다른 파일에서 사용할 수 있게 내보내기
export default projectSlice.reducer;