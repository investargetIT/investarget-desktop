import React from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';

function DebounceSelect({
  fetchOptions,
  allowCreate = false,
  noResult = '未找到相关信息',
  debounceTimeout = 800,
  ...props,
}) {
  const [fetching, setFetching] = React.useState(false);
  const [fetchingMore, setFetchingMore] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const fetchRef = React.useRef(0);
  const dropdownContent = React.useRef(null);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    fetchOptions({ page_index: 1, page_size: 10 }).then(data => {
      const { list: newOptions, total } = data;
      setTotal(total);
      setOptions(newOptions);
    });
  }, []);

  React.useEffect(() => {
    if (!props.value) return;

    // first, search from this.state.list, then, search from remote api
    let item = options.filter(item => item.value == props.value)[0];
    if (item) return;

    if (!props.getNameById) return;

    async function getLableAndSetOption() {
      const label = await props.getNameById(props.value);
      setOptions([{ label, value: props.value }]);
      setTotal(1);
      setPage(1);
    }
    getLableAndSetOption();
  }, [props.value]);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setSearch(value);
      setOptions([]);
      setFetching(true);
      setTotal(0);
      setPage(1);
      fetchOptions({ search: value, page_index: page, page_size: 10 }).then(data => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        const { list: newOptions, total } = data;
        setTotal(total);
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const loadMoreData = () => {
    setPage(page + 1);
    const params = { search, page_index: page + 1, page_size: 10 };
    setFetchingMore(true);
    fetchOptions(params)
      .then(data => {
        const { total, list } = data;
        setTotal(total);
        setOptions([...options, ...list]);
        setFetchingMore(false);
      })
      .catch(error => {
        setFetchingMore(false);
        props.dispatch({
          type: 'app/findError',
          payload: error,
        });
      });
  }

  const handleScroll = () => {
    const el = dropdownContent.current.querySelector('.rc-virtual-list-holder');
    const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (distance < 10 && options.length < total && !fetchingMore) {
      loadMoreData();
    }
  }

  const handleAddBtnClick = () => {
    props.onChange(search);
    selectRef.current.blur();
  }

  const dropdownRender = originalNode => {
    return (
      <div ref={dropdownContent} onScroll={handleScroll}>
        {allowCreate && search && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', minHeight: 32 }}>
            <div style={{ fontWeight: 500, color: '#636e7b' }}>{search}</div>
            <div onClick={handleAddBtnClick}  style={{ color: '#339bd2', cursor: 'pointer' }}>添加</div>
          </div>
        )}
        {originalNode}
        {fetchingMore && <Spin style={{ paddingLeft: 14 }} size="small" />}
      </div>
    );
  }
  // Remove unrecognized props
  const { getData, getNameById, ...rest } = props;
  return (
    <Select
      size="large"
      // open
      showSearch
      // labelInValue
      value={props.value}
      ref={selectRef}
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : noResult}
      {...rest}
      options={options}
      dropdownRender={dropdownRender}
    />
  );
}

export default DebounceSelect;
