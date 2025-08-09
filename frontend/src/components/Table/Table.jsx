import React from 'react';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  className = '',
  striped = true,
  hoverable = true 
}) => {
  const tableClasses = `
    min-w-full divide-y divide-gray-200 ${className}
  `.trim();

  const rowClasses = (index) => `
    ${striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
    ${hoverable ? 'hover:bg-gray-100' : ''}
    ${onRowClick ? 'cursor-pointer' : ''}
    transition-colors duration-150
  `.trim();

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={tableClasses}>
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowClasses(rowIndex)}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-5 py-3 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">📄</div>
          No data available
        </div>
      )}
    </div>
  );
};

export default Table;
