import React, { useState, useEffect, useMemo } from 'react'
import { createColumnHelper, useReactTable, flexRender, getCoreRowModel } from '@tanstack/react-table'
import { Project, ProjectStatus } from '../../types'
import { EditableCell, MonthCell, StatusDropdown } from './cells'

interface ProjectTableProps {
    initialData?: Project[];
    onDataChange?: (data: Project[]) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const columnHelper = createColumnHelper<Project>();

const ProjectTable: React.FC<ProjectTableProps> = ({ initialData = [], onDataChange }) => {
    const [ data, setData ] = useState<Project[]>(initialData);
    const [ year, setYear ] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        onDataChange?.(data);
    }, [data, onDataChange]);

    const handlePrevYear = () => setYear(prev => prev - 1);
    const handleNextYear = () => setYear(prev => prev + 1);

    const updateProject = (projectId: number, updates: Partial<Project>) => {
        setData(prevData => {
            const existingIndex = prevData.findIndex(p => p.id === projectId && p.year === year);

            if (existingIndex >= 0) {
                // 기존 프로젝트 업데이트
                return prevData.map(project =>
                    project.id === projectId && project.year === year
                        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
                        : project
                );
            } else {
                // 새 프로젝트 생성
                const newProject: Project = {
                    id: projectId,
                    memberId: 1, // 예시로 1번 멤버로 설정
                    year,
                    title: '',
                    startMonth: undefined,
                    endMonth: undefined,
                    status: '예정' as ProjectStatus,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isDeleted: false,
                    ...updates
                };
                return [...prevData, newProject];
            }
        });
    };

    const handlePeriodChange = (projectId: number, startMonth?: number, endMonth?: number) => {
        updateProject(projectId, { startMonth, endMonth });
    };

    // 현재 연도의 데이터를 10개 행으로 정규화
    const tableData = useMemo(() => {
        const yearData = data.filter(project => project.year === year);
        const normalizedData: Project[] = [];
    
        for (let i = 1; i <= 10; i++) {
            const existingProject = yearData.find(project => project.id === i);
            if (existingProject) {
                normalizedData.push(existingProject);
            } else {
                // 빈 프로젝트 생성 (UI 표시용)
                normalizedData.push({
                    id: i,
                    memberId: 1,
                    year,
                    title: '',
                    startMonth: undefined,
                    endMonth: undefined,
                    status: '예정',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isDeleted: false
                });
            }
        }
        return normalizedData;
    }, [data, year]);

  // 첫 번째 테이블 컬럼 (프로젝트 정보)
  const infoColumns = [
    columnHelper.display({
      id: 'no',
      header: 'No.',
      cell: ({ row }) => row.index + 1,
      size: 44,
    }),
    columnHelper.accessor('title', {
      header: 'Project Title',
      cell: ({ getValue, row }) => (
        <EditableCell 
          value={getValue() || ''}
          onUpdate={(newValue) => updateProject(row.original.id, { title: newValue })}
          placeholder="프로젝트 제목을 입력하세요"
        />
      ),
      minSize: 377,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => (
        <StatusDropdown 
          value={getValue()}
          onChange={(newStatus) => updateProject(row.original.id, { status: newStatus })}
        />
      ),
      size: 102,
    }),
  ];

  // 두 번째 테이블 컬럼 (월별)
  const monthColumns = MONTHS.map((month, index) => 
    columnHelper.display({
      id: `month-${index + 1}`,
      header: month,
      cell: ({ row }) => (
        <MonthCell 
          month={index + 1}
          projectId={row.original.id}
          startMonth={row.original.startMonth}
          endMonth={row.original.endMonth}
          status={row.original.status}
          onPeriodChange={handlePeriodChange}
        />
      ),
      size: 50,
    })
  );

  const infoTable = useReactTable({
    data: tableData,
    columns: infoColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const monthTable = useReactTable({
    data: tableData,
    columns: monthColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="project">
      {/* 첫 번째 테이블: 프로젝트 정보 */}
      <div className="project__info">
        <table className="project__info-table">
          <thead>
            {infoTable.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {infoTable.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 두 번째 테이블: 월별 */}
      <div className="project__months">
        <div className="project__year-selector">
          <button onClick={handlePrevYear} className="project__year-btn">
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.90609 13.1253L1.15967 7.06267L7.90609 1" stroke="var(--color-xl)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          </button>
          <span className="project__year">{year}년</span>
          <button onClick={handleNextYear} className="project__year-btn">
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.15983 1.00015L7.90625 7.06282L1.15983 13.1255" stroke="var(--color-xl)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          </button>
        </div>
        
        <table className="project__months-table">
          <thead>
            {monthTable.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {monthTable.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="project__months-cell">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
export default ProjectTable