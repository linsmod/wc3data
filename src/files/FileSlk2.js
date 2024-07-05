import React from 'react';
import { Table, Column, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // 引入样式  
const Cell = ({ value, comment }) => {
  comment = comment && comment.replace("\x1b", "\n");
  const content = value == null || value === "" ? '' : value.toString();
  return <div title={comment || content}>{content}</div>;
}

export default class FileSlkView extends React.PureComponent {
  rowGetter = ({ index }) => {
    return this.props.data.rows[index];
  };

  getColumnWidth = ({ index }) => {
    return 500;
  };

  renderColumns() {
    const { data } = this.props;
    // 确保只渲染指定数量的列
    return Array.from({ length: data.cols }, (_, index) => (
      <Column className={'col-' + index}
        key={index}
        width={this.getColumnWidth({ index })}
        dataKey={String(index)}
        cellRenderer={({ cellData, rowIndex }) => (
          <Cell
            value={cellData}
            comment={data.comments && data.comments[rowIndex] && data.comments[rowIndex][index]}
          />
        )}
      />
    ));
  }

  render() {
    const { data, style } = this.props;

    // 确保有数据且cols为有效数值才渲染
    if (!data || !data.rows || !Number.isInteger(data.cols) || data.cols <= 0) return null;

    const tableWidth = data.cols * 50; // 基于正确的cols计算总宽度
    return (
      <div className="FileSlk">
        <AutoSizer>
          {({ width, height }) => (
            <Table
              style={style}
              width={tableWidth}
              height={height - 22} // 可视区域高度，根据需要调整
              rowHeight={23} // 自定义每行的高度
              rowGetter={this.rowGetter}
              rowCount={data.rows.length}
              overscanRowCount={5} // 预加载行数，可优化滚动性能
            >
              {this.renderColumns()}
            </Table>
          )}
        </AutoSizer>
      </div>
    );
  }
}