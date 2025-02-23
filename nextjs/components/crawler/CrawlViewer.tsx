'use client';
interface CrawlViewerProps {
  data: string[];
}

export default function CrawlViewer({ data }: CrawlViewerProps) {


  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      {data.length > 0 && (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="p-2 border-b">
                  {key.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((venue, index) => (
              <tr key={index}>
                {Object.values(venue).map((value, i) => (
                  <td key={i} className="p-2 border-b">
                    {String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
