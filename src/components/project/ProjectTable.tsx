import React from 'react'
import { createColumnHelper, useReactTable, flexRender, getCoreRowModel } from '@tanstack/react-table'
import { Project } from '../../types'
import { EditableCell, MonthCell, StatusDropdown } from './cells'

const columnHelper = createColumnHelper<Project>()

function ProjectTable() {
    const [ data, setData ] = React.useState<Project[]>([])
    const [ year, setYear ] = React.useState<number>(new Date().getFullYear())

    const handlePrevYear = () => setYear(prev => prev - 1)
    const handleNextYear = () => setYear(prev => prev + 1)

    // 컬럼 정의
    const columns = [
        columnHelper.display({
            id: 'no',
            header: 'No.',
            cell: ({ row }) => row.index + 1,
            size: 60,
        }),
        columnHelper.accessor('title', {
            header: 'Project Title',
            cell: ({ getValue, row }) => (
                <EditableCell 
                    // value={ getValue()}
                    // onUpdate={( newValue ) => updateProject(row.original.id, { title: newValue })
                />
            ),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ getValue, row }) => (
                <StatusDropdown 
                    // value={getValue()}
                    // onUpdate={( newStatus ) => updateProject(row.original.id, { status: newStatus })}
                />
            ),
        }),

        // 월별 컬럼들 (Jan ~ Dec)
        ...Array.from ({ length: 12 }, (_, index) => 
            columnHelper.display({
                id: `month-${index + 1}`,
                header: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
                cell: ({ row }) => (
                    <MonthCell 
                    // month={index + 1} year={year} projectId={row.original.id}
                     />
                ),
            })
        ),
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // 테이블 랜더링
    return (
        <div className="project-table">
            <div className="year-selector">
                <button onClick={handlePrevYear}>←</button>
                <span>{year}년</span>
                <button onClick={handleNextYear}>→</button>
            </div>

            <table>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                        <th key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
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
    )
}

export default ProjectTable