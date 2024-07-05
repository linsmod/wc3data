import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { FormControl } from 'react-bootstrap';
import { AutoSizer, List } from 'react-virtualized';
import pathHash, { makeUid, parseUid, equalUid } from 'data/hash';
import { IdCtx } from './FileCtx';
import AppCache from 'data/cache';
import { withAsync } from 'utils';

import Panel from 'react-flex-panel';

const processFiles = (listfile, imExt) => {
  const root = {
    name: "",
    dirs: {},
    files: []
  };
  const names = listfile.split("\n").filter(n => n.length > 0);
  names.forEach(path => {
    const p = path.split(/[\\/:]/);
    let cd = root;
    for (let i = 0; i < p.length - 1; ++i) {
      const pl = p[i].toLowerCase();
      if (!cd.dirs[pl]) {
        cd.dirs[pl] = {
          name: p[i],
          dirs: {},
          files: []
        };
      }
      cd = cd.dirs[pl];
    }
    const unk = path.match(/^Unknown\\([0-9A-F]{16})/);
    const ext = path.match(/\.(\w{1,3})$/);
    cd.files.push({
      name: p[p.length - 1],
      path,
      key: unk ? parseUid(unk[1]) : pathHash(path, imExt),
      ext: ext ? ext[1].toLowerCase() : "unknown",
    });
  });
  const files = [];
  const nameCompare = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  const process = dir => {
    dir.dirs = Object.values(dir.dirs).sort(nameCompare);
    dir.dirs.forEach(sub => process(sub));
    dir.files.sort(nameCompare);
    files.push(...dir.files);
  };
  process(root);
  return { root, files };
}

const FileLink = ({ file }) => (
  <AppCache.DataContext.Consumer>
    {data => (
      <IdCtx.Consumer>
        {id => (
          <Link to={`/${data.id}/files/${makeUid(file.key)}`}
            className={classNames("ObjectLink", { searched: file.searched, selected: equalUid(id, file.key) })}>
            <span className={"Icon file-icon file-" + file.ext} />
            <span className="ObjectName">{file.name}</span>
          </Link>
        )}
      </IdCtx.Consumer>
    )}
  </AppCache.DataContext.Consumer>
);

class FileItem {
  constructor(file, parent) {
    this.file = file;
    this.file.parent = this;
    this.parent = parent;
    this.file.upSearchVisit = (fn) => {
      fn(this.file);
      this.upSearchVisit(fn);
    }
  }
  height = 1;
  render() {
    return <FileLink file={this.file} />;
  }
  renderLine(index) {
    return this.render();
  }
  upSearchVisit(fn) {
    fn(this);
    this.parent && this.parent.upSearchVisit(fn);
  }
  downSearchVisit(fn) {
    fn(this);
    fn(this.file);
  }
}

class FileDirectory {
  constructor(dir, parent) {
    this.parent = parent;
    this.level = (parent ? parent.level + 1 : 0);
    this.title = dir.name || '__ROOT__';
    this.count = dir.files.length;
    this.dirs = {};
    this.children = [];
    dir.dirs.forEach(subDir => {
      const sub = new FileDirectory(subDir, this);
      this.children.push(sub);
      this.dirs[subDir.name.toLowerCase()] = sub;
      this.count += sub.count;
    });
    dir.files.forEach(subFile => {
      this.children.push(new FileItem(subFile, this));
    });
    this.openHeight = parent ? 1 : 0;
    this.children.forEach(c => {
      c.top = this.openHeight;
      this.openHeight += c.height;
    });
    if (!parent) {
      this.expanded = true;
    } else {
      this.expanded = false;
    }
    this.searched = false;
  }
  upSearchVisit(fn) {
    fn(this);
    this.parent && this.parent.upSearchVisit(fn);
  }
  downSearchVisit(fn) {
    fn(this);
    this.children.forEach(x => x.downSearchVisit(fn));
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

  expandFile(file, parts) {
    if (!parts) {
      parts = file.path.split(/[\\/]/);
    }
    if (parts.length > 1) {
      const name = parts[0].toLowerCase();
      const sub = this.dirs[name];
      if (sub) {
        sub.expand();
        return sub.expandFile(file, parts.slice(1)) + sub.top;
      }
    } else {
      const sub = this.children.find(obj => obj.file === file);
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
    if (!this.parent) {
      return <span>no-parent-dir</span>;
    }
    return (
      <div onClick={this.preSelect} className={classNames("ObjectGroup", { expanded: this.expanded, searched: this.searched })}>
        <span className="toggle" onClick={this.toggle} />
        <span onDoubleClick={this.toggle}><span className="Icon" />
          <span className='title'>
            {this.title}
          </span>
        </span>
      </div>
    );
  }
  firstLevelNode(index) {
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
      return this.children[left];
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
      const child = this.children[left];
      const subIndex = index - this.children[left].top;
      const line = this.children[left].renderLine(subIndex);
      let lineStyle = null;
      if (this.parent) {
        if (left < this.children.length - 1) {
          if (subIndex === 0) {
            lineStyle = "tLine";
          } else {
            lineStyle = "line";
          }
        } else if (subIndex === 0) {
          lineStyle = "halfLine";
        }
      }
      return (
        <div className={classNames("indent", lineStyle, { searched: child.searched })}>
          {line}
        </div>
      );
    }
  }
}

class FileListInner extends React.PureComponent {
  state = { search: "", searchResults: null, searched: false };

  constructor(props) {
    super(props);

    const res = processFiles(props.listFile, !props.isMap);
    this.files = res.files;
    this.root = new FileDirectory(res.root);
    this.root.onResize = this.onResize;
  }
  onSearchKeyDown = (e) => {
    if (e.which === 27) {
      this.setState({ search: "", searchResults: null });
      this.stateChanged = true;
    }
  }
  onSearch = (e) => {
    const search = e.target.value.trim();
    let found = [];
    let hasSearchResult = false;
    if (search != '' && this.files) {

      //reset
      this.root.downSearchVisit(node => node.searched = false);
      const re = new RegExp(search.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), "i");
      this.files.forEach((file, i) => {
        let searched = !!file.path.match(re);
        file.upSearchVisit((node) => {
          node.searched = node.searched || searched;
          if (node.searched) {
            hasSearchResult = true;
          }
        })
      });
      this.setState({ search: e.target.value, searchResults: found, searched: hasSearchResult });
    }
    else {
      this.root.downSearchVisit(node => node.searched = false);
      this.setState({ search: e.target.value, searchResults: null, searched: hasSearchResult });
    }
    this.stateChanged = true;
  }

  onResize = () => {
    this.forceUpdate();
  }
  rowRenderer = ({ index, ...options }) => {

    const { key, style } = options;
    const node = this.root.children[index];

    const flNode = this.root.firstLevelNode(index);
    return (
      <div className={classNames("TreeRow", { searched: flNode && flNode.searched })} key={key} style={style}>
        {this.root.renderLine(index)}
      </div>
    );
  }
  rowRendererSearch = ({ index, ...options }) => {
    const { key, style } = options;
    return (
      <div className={"TreeRow"} key={key}>
        {this.root.renderLine(index)}
      </div>
    );
  }
  render() {
    const { listFile, id, className, isMap, ...props } = this.props;
    const { search, searchResults, searched } = this.state;

    if (!this.root) {
      return null;
    }

    if (!searchResults && !equalUid(this.root._id, id)) {
      const file = this.files && this.files.find(obj => equalUid(obj.key, id));
      if (file) {
        this.root.onResize = null;
        const index = this.root.expandFile(file);
        this.root.onResize = this.onResize;
        this.root._id = id;
        setTimeout(() => {
          if (this._list) {
            this._list.scrollToRow(index);
          }
        });
      }
    }
    return (
      <Panel className={classNames(className, "ObjectList")} {...props}>
        <div className="search-box">
          <FormControl type="text" value={search} placeholder="Search" onKeyDown={this.onSearchKeyDown} onChange={this.onSearch} />
        </div>
        <div className={classNames("ObjectListItems", searched)}>
          <AutoSizer>
            {({ width, height }) => (
              <List className="ObjectLines"
                ref={node => this._list = node}
                width={width}
                height={height}
                rowCount={this.root.height}
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

const EmptyPanel = ({ id, listFile, className, ...props }) => <Panel className={classNames(className, "ObjectList")} {...props} />;

export const FileList = withAsync({
  listFile: ({ data }) => data.listFile(),
}, ({ data, ...props }) => <FileListInner key={data.id} isMap={data.isMap} {...props} />, EmptyPanel, EmptyPanel);
