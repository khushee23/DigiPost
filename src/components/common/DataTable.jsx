import React from 'react';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = '_id',
  isLoading = false,
  emptyMessage = 'No records found matching your criteria.',
  pagination = null, // { currentPage, totalItems, pageSize, onPageChange }
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="bg-neutral-50 text-xs font-semibold text-neutral-700 uppercase tracking-wider border-b border-neutral-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} scope="col" className={`px-4.5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4.5 py-12 text-center text-sm text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState description={emptyMessage} className="border-0 rounded-none py-12" />
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item[keyField] || rowIndex}
                  className="hover:bg-neutral-50/80 transition-colors duration-150"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-4.5 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(item, rowIndex) : item[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalItems > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};
