import { MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, useRef } from 'react';
import { Row } from 'react-table';
import { RowCell } from './rowCell';
import { CrudProvider } from '@/providers/crudContext';
import { InlineSaveMode } from './interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { useDataTableStore } from '@/providers/index';
import { useStyles } from './styles/styles';

export type RowEditMode = 'read' | 'edit';

export interface ISortableRowProps {
  prepareRow: (row: Row<any>) => void;
  onClick: (row: Row<any>) => void;
  onDoubleClick: (row: Row<any>, index: number) => void;
  row: Row<any>;
  index: number;
  selectedRowIndex?: number;
  allowEdit: boolean;
  updater?: (data: any) => Promise<any>;
  allowDelete: boolean;
  deleter?: () => Promise<any>;
  editMode?: RowEditMode;
  allowChangeEditMode: boolean;
  inlineSaveMode?: InlineSaveMode;
  inlineEditorComponents?: IFlatComponentsStructure;
  inlineDisplayComponents?: IFlatComponentsStructure;
}

interface RowDragHandleProps {
  row: Row<any>;
}
export const RowDragHandle: FC<RowDragHandleProps> = () => {
  const { setDragState } = useDataTableStore();
  const handleMouseDown = () => {
    setDragState('started');
  };
  const handleMouseUp = () => {
    setDragState(null);
  };
  return (
    <div className="row-handle" style={{ cursor: 'grab' }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <MoreOutlined />
    </div>
  );
};

export const TableRow: FC<ISortableRowProps> = (props) => {
  const {
    row,
    prepareRow,
    onClick,
    onDoubleClick,
    index,
    selectedRowIndex,
    updater,
    deleter,
    allowEdit,
    allowDelete,
    editMode,
    allowChangeEditMode,
    inlineSaveMode,
    inlineEditorComponents,
    inlineDisplayComponents,
  } = props;

  const { styles } = useStyles();
  const { hoverRowId, setHoverRowId, dragState: draggingRowId, setDragState } = useDataTableStore();
  const tableRef = useRef(null);

  const handleRowClick = () => {
    onClick(row);
  };

  const handleRowDoubleClick = () => {
    onDoubleClick(row, index);
  };

  prepareRow(row);

  // Review if deselecting is required for click outside
  /*useEffect(() => {
    const onClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        onClick(null);
      }
    };
    document.addEventListener('click', onClickOutside);
  }, []);*/

  const rowId = row.original.id ?? row.id;

  return (
    <CrudProvider
      isNewObject={false}
      data={row.original}
      allowEdit={allowEdit}
      updater={updater}
      allowDelete={allowDelete}
      deleter={deleter}
      mode={editMode === 'edit' ? 'update' : 'read'}
      allowChangeMode={allowChangeEditMode}
      autoSave={inlineSaveMode === 'auto'}
      editorComponents={inlineEditorComponents}
      displayComponents={inlineDisplayComponents}
    >
      <div
        //key={rowId}
        onMouseEnter={() => {
          if (!draggingRowId){
            if (hoverRowId !== rowId)
              setHoverRowId(rowId);
          } else {
            if (draggingRowId === 'finished')
              setDragState(null);
          }
        }}
        onMouseLeave={() => {
          setHoverRowId(null);
        }}
        ref={tableRef}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        {...row.getRowProps()}
        className={classNames(
          styles.tr,
          styles.trBody,
          { [styles.trOdd]: index % 2 === 0 },
          { [styles.trSelected]: selectedRowIndex === row?.index },
          { [styles.shaHover]: hoverRowId === rowId },
        )}
        key={rowId}
      >
        {row.cells.map((cell, cellIndex) => {
          return <RowCell cell={cell} key={cellIndex} row={row.cells} rowIndex={index}/>;
        })}
      </div>
    </CrudProvider>
  );
};

export const SortableRow: FC<ISortableRowProps> = (props) => {
  return <TableRow {...props} />;
};