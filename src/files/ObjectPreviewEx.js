import React from 'react';
import { isArray, isObject } from 'lodash';
import { ObjectIcon } from 'objects/ObjectCtx';

const ObjectPreviewEx = ({ data }) => {
  // 简单的逻辑判断数据类型以决定预览内容
  if (isObject(data) || isArray(data)) {
    // 对于对象或数组，可能只展示类型和长度，避免深度预览
    return (
      <div className="object-preview-ex">
        <ObjectIcon typeOfData={typeof data} /> {/* 假定根据数据类型展示图标 */}
        <span>{`${typeof data} [${data.length || 'N/A'}]`}</span>
      </div>
    );
  } else if (typeof data === 'string') {
    // 字符串类型可能截取前几个字符预览
    return (
      <div className="object-preview-ex">
        <ObjectIcon typeOfData="string" />
        <span>"{data.substring(0, 20)}{data.length > 20 ? '...' : ''}"</span>
      </div>
    );
  } else if (typeof data === 'number' || typeof data === 'boolean') {
    // 数字或布尔值直接展示
    return (
      <div className="object-preview-ex">
        <ObjectIcon typeOfData={typeof data} />
        <span>{data}</span>
      </div>
    );
  } else {
    // 其他类型的数据简单处理
    return (
      <div className="object-preview-ex">
        <ObjectIcon typeOfData="unknown" />
        <span>{typeof data}</span>
      </div>
    );
  }
};

export default ObjectPreviewEx;