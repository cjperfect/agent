import React from "react";

const TableView = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-4 text-gray-400">暂无数据</div>;
  const headers = Object.keys(data[0]);
  return (
    <div
      className="overflow-auto h-full w-full bg-white rounded-2xl shadow-lg p-4 border border-gray-200"
      style={{ maxHeight: "100%" }}
    >
      <table className="min-w-max text-sm border-separate border-spacing-0">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="sticky top-0 z-10 border-b-2 border-gray-200 bg-gradient-to-b from-gray-100 to-white font-semibold px-3 py-4 text-gray-700 text-left shadow-sm text-base"
                style={{ top: -16 }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={
                i % 2 === 0 ? "bg-white hover:bg-blue-50 transition" : "bg-gray-50 hover:bg-blue-50 transition"
              }
            >
              {headers.map((header) => (
                <td key={header} className="px-3 py-2 border-b border-gray-100 text-gray-800">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #e0e7ef;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default TableView;
