import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import AppCache from 'data/cache';
import { tagString } from 'data/tagString';

// 假定已经存在的辅助函数或组件
import { ObjectIcon } from './ObjectCtx';
// import { getObjectById } from './dataUtils'; // 假定这是一个实用函数，用于根据ID获取对象详情

const TooltipContent = ({ objectId }) => {
  const [object, setObject] = useState(null);

  useEffect(() => {
    async function fetchObject() {
      const data = objectId; //await getObjectById(objectId);
      setObject(data);
    }
    if (objectId) {
      fetchObject();
    }
  }, [objectId]);

  if (!object) return <Popover.Title>Loading...</Popover.Title>;

  return (
    <div>
      <Popover.Title>{object.name}</Popover.Title>
      <Popover.Content>
        {object.description || "No description available."}
        {object.icon && (
          <img
            src={AppCache.image(object.icon)}
            alt={`${object.name} Icon`}
            className="object-icon"
          />
        )}
      </Popover.Content>
    </div>
  );
};

const Tooltip = ({ objectId, children }) => {
  return (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Popover>
          <TooltipContent objectId={objectId} />
        </Popover>
      }>
      {typeof children === 'string' ? (
        <span>{children}</span>
      ) : (
        children
      )}
    </OverlayTrigger>
  );
};

export default Tooltip;