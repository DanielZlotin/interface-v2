import React, { ReactChild } from 'react';
import { Box } from 'theme/components';
import { ArrowUp, ArrowDown } from 'react-feather';
import { DataTable } from 'components';
import 'components/styles/CustomTable.scss';
import { isMobile } from 'react-device-detect';

export interface CustomTableProps<T> {
  emptyMessage?: string;
  showPagination?: boolean;
  rowsPerPage?: number;
  headCells: any;
  data: any;
  defaultOrderBy?: T;
  defaultOrder?: 'asc' | 'desc';
  mobileHTML: (item: any, index: number) => ReactChild;
  desktopHTML: (
    item: any,
    index: number,
    page: number,
    rowsPerPage: number,
  ) => any;
}

const CustomTable: React.FC<CustomTableProps<any>> = ({
  rowsPerPage = 5,
  showPagination = true,
  emptyMessage,
  headCells,
  data,
  defaultOrderBy,
  defaultOrder,
  mobileHTML,
  desktopHTML,
}) => {
  return (
    <Box className='tableContainer'>
      {isMobile ? (
        <>
          {data.map((item: any, index: number) => (
            <Box key={index}>{mobileHTML(item, index)}</Box>
          ))}
        </>
      ) : (
        <DataTable
          defaultOrderBy={defaultOrderBy}
          defaultOrder={defaultOrder}
          emptyMesage={emptyMessage}
          showPagination={showPagination}
          headCells={headCells}
          data={data}
          rowPerPage={rowsPerPage}
          sortUpIcon={<ArrowUp />}
          sortDownIcon={<ArrowDown />}
          showEmptyRows={false}
          renderRow={(item, index, page, rowsPerPage) => {
            return (
              <tr key={index}>
                {desktopHTML(item, index, page, rowsPerPage).map(
                  (cellItem: any, ind: number) => (
                    <td
                      key={ind}
                      className={cellItem.button ? 'buttonCell' : ''}
                    >
                      {cellItem.html}
                    </td>
                  ),
                )}
              </tr>
            );
          }}
        />
      )}
    </Box>
  );
};

export default CustomTable;
