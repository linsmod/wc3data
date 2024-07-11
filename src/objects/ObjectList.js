import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { RawNames, RawNamesSwitch, SortNames, BuildCtx, TypeCtx, IdCtx, ObjectFilters, ObjectIcon } from './ObjectCtx';
import { FormControl, Button, Glyphicon } from 'react-bootstrap';
import { AutoSizer, List } from 'react-virtualized';
import DataDownload from './DataDownload';

import Panel from 'react-flex-panel';

import './ObjectList.scss';

const ObjectName = ({ object }) => (
  <RawNames.Consumer>
    {raw => {
      if (raw) {
        if (object.base) {
          return `${object.id}:${object.base} (${object.name})`;
        } else {
          return `${object.id} (${object.name})`;
        }
      } else {
        return object.name;
      }
    }}
  </RawNames.Consumer>
);

const ObjectLink = ({ object }) => (
  <BuildCtx.Consumer>
    {build => (
      <TypeCtx.Consumer>
        {type => (
          <IdCtx.Consumer>
            {id => (
              <Link to={`/${build}/${type}/${object.id}`}
                className={classNames("ObjectLink", { selected: id === object.id, searched: object.searched })}>
                <ObjectIcon object={object} />
                <span className="ObjectName"><ObjectName object={object} /></span>
              </Link>
            )}
          </IdCtx.Consumer>
        )}
      </TypeCtx.Consumer>
    )}
  </BuildCtx.Consumer>
);

class ObjectItem {
  constructor(object, parent) {
    this.object = object;
    this.object.parent = this;
    this.object.upVisit = (fn) => {
      fn(this.object);
      this.object.parent.upVisit(fn);
    }
    this.parent = parent;
  }
  height = 1;
  upVisit(fn) {
    fn(this);
    this.parent.upVisit(fn);
  }
  downVisit(fn) {
    fn(this);
    fn(this.object);
  }
  render() {
    return <ObjectLink object={this.object} />;
  }
  renderLine(index) {
    return this.render();
  }
}

class ObjectGroup {
  constructor(objects, filters, parent, title) {
    this.parent = parent;
    this.level = (parent ? parent.level + 1 : 0);
    this.count = objects.length;
    this._title = title;
    if (title) {
      this.title = `${title} (${this.count})`;
    }

    if (filters && filters.length) {
      this.filter = filters[0];
      const subs = {};
      objects.forEach(obj => {
        const cat = filters[0].name(obj);
        subs[cat] = (subs[cat] || []);
        subs[cat].push(obj);
      });
      const rest = filters.slice(1);
      this.childrenByName = {};
      this.children = filters[0].order.filter(cat => !parent || subs[cat]).map(cat => {
        return this.childrenByName[cat] = new ObjectGroup(subs[cat] || [], rest, this, cat);
      });
    } else {
      this.children = objects.map(obj => new ObjectItem(obj, this)).sort((a, b) => a.object.name.localeCompare(b.object.name));
    }
    this.openHeight = parent ? 1 : 0;
    this.children.forEach(c => {
      c.top = this.openHeight;
      this.openHeight += c.height;
    });
    if (!parent) {
      this.expanded = true;
    } else if (this.level > 1) {
      this.expanded = false;
    } else {
      this.expanded = this.count > 0;
    }
  }
  upVisit(fn) {
    fn(this);
    this.parent && this.parent.upVisit(fn);
  }
  downVisit(fn) {
    fn(this);
    this.children.forEach(x => x.downVisit(fn));

  }
  modHeight(delta, child) {
    let index = child ? this.children.indexOf(child) : -1;
    if (index >= 0) {
      while (++index < this.children.length) {
        this.children[index].top += delta;
      }
    }
    this.openHeight += delta;
    if (this.parent && this.expanded) {
      this.parent.modHeight(delta, this);
    } else if (this.onResize) {
      this.onResize(this.height);
    }
  }

  get height() {
    return this.expanded ? this.openHeight : 1;
  }

  expandItem(object) {
    if (this.filter) {
      const name = this.filter.name(object);
      const sub = this.childrenByName[name];
      if (sub) {
        sub.expand();
        return sub.expandItem(object) + sub.top;
      }
    } else {
      const sub = this.children.find(obj => obj.object === object);
      if (sub) {
        return sub.top;
      }
    }
    return 0;
  }

  expand() {
    if (!this.expanded && this.count > 0) {
      this.expanded = true;
      if (this.parent) {
        this.parent.modHeight(this.openHeight - 1, this);
      }
    }
  }

  collapse() {
    if (this.expanded && this.parent) {
      this.expanded = false;
      this.parent.modHeight(1 - this.openHeight, this);
    }
  }

  toggle = () => {
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  render() {
    let n = 0;
    this.downVisit(node => n += ((node.__proto__.constructor.name == 'ObjectItem' && node.searched) ? 1 : 0));
    if (n) {
      this.title = `${this._title} (${n}/${this.count})`;
    }
    if (!this.parent) {
      return null;
    }
    return (
      <div className={classNames("ObjectGroup", { expanded: this.expanded, searched: this.searched })}>
        <span className="toggle" onClick={this.toggle} />
        <span onDoubleClick={this.toggle}><span className="Icon" />
          <span className='title'>{this.title}</span>
        </span>
      </div>
    );
  }
  firstLevelChild(index) {
    if (this.expanded) {
      let left = 0, right = this.children.length - 1;
      while (left < right) {
        const mid = (left + right + 1) >> 1;
        if (this.children[mid].top > index) {
          right = mid - 1;
        } else {
          left = mid;
        }
      }
      return this.children[left]
    }
    return null;
  }
  renderLine(index) {
    if (this.parent && !index) {
      return this.render();
    }
    if (this.expanded) {
      let left = 0, right = this.children.length - 1;
      while (left < right) {
        const mid = (left + right + 1) >> 1;
        if (this.children[mid].top > index) {
          right = mid - 1;
        } else {
          left = mid;
        }
      }
      const subIndex = index - this.children[left].top;
      const line = this.children[left].renderLine(subIndex);
      let lineStyle = null;
      if (left < this.children.length - 1) {
        if (subIndex === 0) {
          lineStyle = "tLine";
        } else {
          lineStyle = "line";
        }
      } else if (subIndex === 0) {
        lineStyle = "halfLine";
      }
      if (this.parent) {
        return (
          <div className={classNames("indent", lineStyle)}>
            {line}
          </div>
        );
      } else {
        return line;
      }
    }
  }
}

export class ObjectList extends React.PureComponent {
  state = { search: "", searchResults: null };

  static contextType = RawNames;

  onSearchKeyDown = (e) => {
    if (e.which === 27) {
      this.setState({ search: "", searchResults: null });
      if (this._list) {
        this._list.forceUpdateGrid();
      }
    }
  }
  onSearch = (e) => {
    const { data, type } = this.props;
    const search = e.target.value.trim();
    console.log(search)
    let found = 0;

     // reset
     this.group.downVisit((node) => {
      node.searched = false;
    });
    if (search) {
      const re = new RegExp("\\b" + search.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), "i");
      const isMatch = obj => {
        if (obj.type !== type) return false;
        if (this.context && obj.id.match(re)) return true;
        if (obj.name.match(re)) return true;
        if (obj.data.propernames && obj.data.propernames.match(re)) return true;
        if (obj.name.indexOf(search) != -1) {
          // console.log('matching', search, obj)
          return true;
        }
        return false;
      };
     
      data.objects.forEach(obj => {
        const matched = isMatch(obj);
        if (matched) {
          obj.upVisit((node) => {
            node.searched = node.searched | matched;
            if (node.searched) {
              found++;
              // console.log('found', found, node);
            }
          })
        }
      });

    }
    // console.log('forceUpdateGrid')
    if (this._list) {
      this._list.forceUpdateGrid();
    }
    this.setState({ search: e.target.value, searchResults: found });
  }


  onResize = () => {
    this.forceUpdate();
  }

  rowRenderer = ({ index, ...options }) => {
    const { key, style } = options;
    const flNode = this.group.firstLevelChild(index);
    return (
      <div className={classNames("TreeRow", { searched: flNode && flNode.searched })} key={key} style={style}>
        {this.group.renderLine(index)}
      </div>
    );
  }

  onDownload = () => {
    this.setState({ showDownload: this.props.type });
  }
  onCloseDownload = () => {
    this.setState({ showDownload: false });
  }

  render() {
    const { data, type, id, className, ...props } = this.props;
    const { search, searchResults, showDownload } = this.state;
    if (!this.group || this.group._data !== data || this.group._type !== type) {
      const filters = ObjectFilters[type];
      if (!filters) {
        return null;
      }
      this.group = new ObjectGroup(data.objects.filter(obj => obj.type === type), filters);
      this.group._data = data;
      this.group._type = type;
      this.group.onResize = this.onResize;
      setTimeout(() => {
        if (this._list) {
          this._list.forceUpdateGrid();
        }
      });
    }
    if (!searchResults && this.group._id !== id) {
      const object = data.objects.find(obj => obj.type === type && obj.id === id);
      if (object) {
        this.group.onResize = null;
        const index = this.group.expandItem(object);
        this.group.onResize = this.onResize;
        this.group._id = id;
        setTimeout(() => {
          if (this._list) {
            this._list.scrollToRow(index);
          }
        });
      }
    }
    return (
      <Panel className={classNames(className, "ObjectList")} {...props}>
        <DataDownload data={data} show={showDownload} onHide={this.onCloseDownload} />
        <div className="search-box">
          <FormControl type="text" value={search} placeholder="Search" onKeyDown={this.onSearchKeyDown} onChange={this.onSearch} />
          <Button active={!!showDownload} onClick={this.onDownload} bsSize="small"><Glyphicon glyph="download-alt" /></Button>
          <RawNames.Consumer>
            {rawNames => (
              <RawNamesSwitch.Consumer>
                {onSwitch => <Button active={rawNames} onClick={onSwitch} bsSize="small"><Glyphicon glyph="cog" /></Button>}
              </RawNamesSwitch.Consumer>
            )}
          </RawNames.Consumer>
        </div>
        <div className="ObjectListItems">
          <AutoSizer>
            {({ width, height }) => (
              <List className="ObjectLines"
                ref={node => this._list = node}
                width={width}
                height={height}
                rowCount={this.group.height}
                rowHeight={18}
                rowRenderer={this.rowRenderer}
              />
            )}
          </AutoSizer>
        </div>
      </Panel>
    );
  }
}
