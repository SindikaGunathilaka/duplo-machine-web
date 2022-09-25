import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';
import classes from './ViewPaperItem.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStepBackward, faFastBackward, faStepForward, faFastForward, faSort, faSortAlphaDown, faSortAlphaUp, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons'
// import "react-datetime/css/react-datetime.css";
import { Col, Container, InputGroup, FormControl, Modal, Row, Table } from 'react-bootstrap';
import { faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Popup } from 'semantic-ui-react';
import PopupMessage from '../../PopupMessages/PopupMessages';
import CreatePaperItem from '../CreatePaperItem/CreatePaperItem';
import EditPaperItem from '../EditPaperItem/EditPaperItem';
import SpinnerAnimation from '../../../components/UI/Spinner/SpinnerAnimation/SpinnerAnimation';
// import * as CustomerService from '../../../../api/methods/Customers';
// import * as TokenDecode from '../../../../helpers/TokenDecode';
import noContent from '../../../assets/images/no-contents.svg';
import axios from 'axios';
import { BASE_URL } from '../../../API/ApiCore';
import ActiveDeactiveConfirmPopup from '../../PopupMessages/ActiveDeactiveConfirmPopUp/ActiveDeactiveConfirmPopup'


let rolePermission = [];
let params = {};
class ViewPaperItem extends Component {
  constructor() {
    super();
    this.state = {
      paperItems: [],
      currentPage: 1,
      paperItemsPerPage: 8,
      faProductIconHandler: false,
      searchFilter: "",
      paperItemsLength: 0,
      createPaperItemShowHide: false,
      editPaperItemShowHide: false,
      resultFetched: false,
      isDescending: true,
      sortBy: "id",

      activeDeactiveMessage: "",
      popupMessage: "",
      popUpActiveDeActive: false,
      paperSizeObj: {}
    }
  }

  componentDidMount = async () => {
    // rolePermission = TokenDecode.getUserRolePermission();
    await this.getResponse();
  }

  getResponse = async () => {
    try {
      const paperItems = await axios.get(BASE_URL + "/v1/paper-items");
      await this.setState({
        paperItems: paperItems.data
      })
      console.log(this.state.paperItems, "ttttt")
    } catch (error) {
      console.log(error);
    }
  }
//   setParams = () => {
//     if (this.state.searchFilter !== "") {
//       params = {
//         name: this.state.searchFilter,
//         page: this.state.currentPage - 1,
//         size: this.state.paperItemsPerPage,
//         sortBy: this.state.sortBy,
//         isDescending: this.state.isDescending
//       }
//     } else {
//       params = {
//         page: this.state.currentPage - 1,
//         size: this.state.paperItemsPerPage,
//         sortBy: this.state.sortBy,
//         isDescending: this.state.isDescending
//       }
//     }
//   }

  onActiveHandler = async (paperSize) => {
    const data = {
      "id": paperSize.id,
      "page_name": paperSize.page_name,
      "active_status": paperSize.active_status === false ? true : false,
    };
    await this.setState({
      paperSizeObj: data,
      messageType: paperSize.active_status === true ? "deactivate" : "activate",
      activeDeactiveMessage: paperSize.active_status === true ? "Do you want to deactivate this paper size?" : "Do you want to activate this paper size?",
      popUpActiveDeActive: !this.state.popUpActiveDeActive
    });

  }

  closeActiveDeActivePopup = async () => {
    await this.setState({
      popUpActiveDeActive: false
    });
  }

  onActiveDeActiveHandler = async () => {
    const { paperSizeObj } = this.state
    await this.closeActiveDeActivePopup();
    const paperSizeRes = await axios.put(BASE_URL + "/v1/paper-sizes/" + paperSizeObj.id, paperSizeObj);
    console.log(paperSizeRes, "paperSizeRes")
    if (paperSizeRes.status === 200 || paperSizeRes.status === 201) {
      await this.setState({
        popupMessage: paperSizeObj.active_status === false ? "Paper Size Deactivated successfully" : "Paper Size activated successfully",
        messageType: "success"
      })
      await this.showPopup();
      await this.getResponse();
    } else {
      await this.setState({
        popupMessage: "Error occurred",
        messageType: "error"
      })
      await this.showPopup();
    }

  }

  showPopup = async () => {
    await this.setState({
      popUpTrue: !this.state.popUpTrue
    });
    if (this.state.popUpTrue === true) {
      setTimeout(() => {
        this.setState({
          popUpTrue: false,
          popupMessage: ''
        });
      }, 2000);
    }
  }

  //   exporToExecelHandler = async () => {
  //     const downloadData = await CustomerService.downloadCustomers();
  //     const url = window.URL.createObjectURL(new Blob([downloadData]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', 'customers.xlsx');
  //     document.body.appendChild(link);
  //     link.click();

  //   }

  compareByAsc(key) {
    return function (a, b) {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    };
  }

  compareByDesc(key) {
    return function (a, b) {
      if (a[key] < b[key]) return 1;
      if (a[key] > b[key]) return -1;
      return 0;
    };
  }

  sortBy = async (key) => {
    await this.setState({
      sortBy: key,
      isDescending: !this.state.isDescending,
      currentPage: 1
    });
    await this.getResponse();
  }



  firstPage = async () => {

    if (this.state.currentPage > 1) {
      await this.setState({
        currentPage: 1
      })
    }
    await this.getResponse();
  }

  prevPage = async () => {

    if (this.state.currentPage > 1) {
      await this.setState({
        currentPage: this.state.currentPage - 1
      })
    }
    await this.getResponse();
  }

  lastPage = async () => {
    if (this.state.currentPage < Math.ceil(this.state.paperItemsLength / this.state.paperItemsPerPage)) {
      await this.setState({
        currentPage: Math.ceil(this.state.paperItemsLength / this.state.paperItemsPerPage)
      })
    }
    await this.getResponse();
  }

  nextPage = async () => {
    if (this.state.currentPage < Math.ceil(this.state.paperItemsLength / this.state.paperItemsPerPage)) {
      await this.setState({
        currentPage: this.state.currentPage + 1
      })
    }
    await this.getResponse();
  }

  pagesPerPageHandler = async (e) => {
    await this.setState({
      paperItemsPerPage: e.target.value,
      currentPage: 1
    });
    await this.getResponse();
  }

  searchEventsHandler = async (title, name) => {
    await this.setState({
      [name]: title.toLowerCase(),
      resultFetched: false,
      currentPage: 1,
      sortBy: "id",
      isDescending: true,
    });
    await this.getResponse();
  }

  action = (id) => {
    return (
      <div>
        <Popup trigger={<FontAwesomeIcon icon={faEllipsisV} size="x" />} flowing hoverable position='bottom right'>
          <div className={classes.popUpAction} onClick={() => {
            this.props.SelectPaperItemId(id);
            this.handleEditPageSizeModalShowHide();
          }} >
            &nbsp;&nbsp;&nbsp;<FontAwesomeIcon icon={faEdit} size="x" />|&nbsp;&nbsp;&nbsp;&nbsp;
            <label>Edit</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </Popup>
      </div>
    );
  }

  handleCreatePageSizeModalShowHide = () => {
    this.setState({
      createPaperItemShowHide: !this.state.createPaperItemShowHide
    });
  }

  handleEditPageSizeModalShowHide = () => {
    this.setState({
      editPaperItemShowHide: !this.state.editPaperItemShowHide
    });
  }

  render() {
    const { paperItems, currentPage, paperItemsPerPage, faProductIconHandler, paperItemsLength, resultFetched } = this.state;
    let currentPaperItems = paperItems;
    console.log(this.state, "state in render");

    return (
      <div className={classes.MainPanel}>
      <div className={classes.ContentWrapper}>

        <Container fluid>
          <Row>
            <div style={{ marginTop: '1%' }}></div>
          </Row>
          <Row style={{ height: "4rem" }}>
            <Col style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", fontSize: "2rem" }}>
              <label className={classes.pageTitleContainer}>View Paper Items</label>
            </Col>
            <Col style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <input name="searchFilter" placeholder="Search by Page Size Name" className={classes.searchIconText} onChange={(e) => this.searchEventsHandler(e.target.value, e.target.name)} />
            </Col>
            <Col md="auto" xl="auto" lg="auto" xs="auto" sm="auto" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <button className={classes.customButtonForView} onClick={() => this.handleCreatePageSizeModalShowHide()}>Add Paper Item</button>
            </Col>
          </Row>
          <Row className={classes.responsiveHide} style={{ marginTop: '1%' }}>
            <Col style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", fontSize: "1.1rem", fontWeight: "bold" }}>
            </Col>
            <Col style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              {/* {rolePermission?.includes("CUSTOMERS_EXPORT") ? <img src="/images/xlsx-file-format-extension.svg" className={classes.buttonPagination} onClick={this.exporToExecelHandler} style={{ width: '1.5rem', cursor: 'pointer' }} /> : ""} */}
            </Col>
          </Row>
          <Row>
            <Col>
              {this.state.paperItems?.length === 0 && !resultFetched ?
                <div>
                  <p><SpinnerAnimation /></p>
                </div> :
                <Table hover responsive>
                  <thead >
                    <tr>
                      <th style={{ minWidth: "250px", verticalAlign: "initial" }} className={classes.thBtnStart} onClick={() => this.sortBy("customerCode")} >Paper Item Name <FontAwesomeIcon icon={faSort} /></th>
                      <th style={{  minWidth: "250px", verticalAlign: "initial" }} className={classes.thBtn} onClick={() => this.sortBy("firstName")}>Price Of Rim <FontAwesomeIcon icon={faProductIconHandler === true ? faSortAlphaUp : faSortAlphaDown} /></th>
                      <th style={{ minWidth: "250px", verticalAlign: "initial" }} className={classes.thBtn} onClick={() => this.sortBy("firstName")}>Papers Per Rim<FontAwesomeIcon icon={faProductIconHandler === true ? faSortAlphaUp : faSortAlphaDown} /></th>
                      <th style={{ minWidth: "200px", verticalAlign: "initial" }} className={classes.thBtn} onClick={() => this.sortBy("firstName")}>Paper Cost<FontAwesomeIcon icon={faProductIconHandler === true ? faSortAlphaUp : faSortAlphaDown} /></th>
                      <th style={{ minWidth: "200px", verticalAlign: "initial" }} className={classes.thBtn} onClick={() => this.sortBy("activeStatus")}> Status <FontAwesomeIcon icon={faSort} /></th>
                      <th className={classes.thBtnEnd}></th>
                    </tr>
                  </thead>
                  <tbody className={classes.tbody}>
                    {currentPaperItems?.length === 0 ?
                      <tr align="center">
                        <td colSpan="6">
                          <img width="50px" height="50px" src={noContent} />
                          <br />
                          <b>No paper sizes Found</b>
                        </td>
                      </tr>
                      : currentPaperItems.map((s, i) => (
                        <tr key={s.id} >
                          <td style={{ cursor: "default" }} className={(currentPaperItems.length === i + 1) ? classes.tdLastStart : classes.tdCenter}>{s.paper_item_name ? s.paper_item_name : "-"}</td>
                          <td style={{ cursor: "default" }} className={classes.tdCenter}>{s.price_of_rim ? s.price_of_rim : "-"}</td>
                          <td style={{ cursor: "default" }} className={classes.tdCenter}>{s.papers_per_rim ? s.papers_per_rim : "-"}</td>
                          <td style={{ cursor: "default" }} className={classes.tdCenter}>{s.paper_cost ? s.paper_cost : "-"}</td>
                          <td style={{ cursor: "pointer" }} className={classes.tdCenter}>
                            <FontAwesomeIcon onClick={() => this.onActiveHandler(s)} className={classes.toggle} icon={s.active_status === false ? faToggleOff : faToggleOn} size="2x" />
                          </td>
                          <td className={(currentPaperItems.length === i + 1) ? classes.tdLastEnd : classes.tdCenter}>
                            {/* {this.action(s.id)} */}
                            <FontAwesomeIcon className={classes.toggle} style={{ cursor: "pointer" }} icon={faEdit} size="x"
                              onClick={() => {
                                this.props.SelectPaperItemId(s.paper_item_name);
                                this.handleEditPageSizeModalShowHide();
                              }}
                            />
                          </td>
                        </tr>

                      ))}
                  </tbody>
                </Table>
              }
            </Col>
          </Row>

          <Modal show={this.state.createPaperItemShowHide} centered size="lg" onHide={() => this.handleCreatePageSizeModalShowHide()} backdrop="static" keyboard={false}>
            <Modal.Header closeButton >
              <Modal.Title>Create Page Item</Modal.Title>
            </Modal.Header>
            <Modal.Body><CreatePaperItem
              handleClose={() => this.handleCreatePageSizeModalShowHide()}
              handleGetResponse={() => this.getResponse()}
            />
            </Modal.Body>
          </Modal>

          <Modal show={this.state.editPaperItemShowHide} centered size="lg" onHide={() => this.handleEditPageSizeModalShowHide()} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Page Item</Modal.Title>
            </Modal.Header>
            <Modal.Body><EditPaperItem
              handleClose={() => this.handleEditPageSizeModalShowHide()}
              handleGetResponse={() => this.getResponse()} /></Modal.Body>
          </Modal>

          <div>
            <Modal show={this.state.popUpTrue} centered size="sm">
              <Modal.Body><PopupMessage
                handleClose={() => this.showPopup()}
                message={this.state.popupMessage}
                messageType={this.state.messageType}
              /></Modal.Body>
            </Modal>

            <Modal show={this.state.popUpActiveDeActive} centered size="sm">
              <Modal.Body><ActiveDeactiveConfirmPopup
                message={this.state.activeDeactiveMessage}
                messageType={this.state.messageType}
                handleClose={() => this.closeActiveDeActivePopup()}
                confirmDeactivationHandler={() => this.onActiveDeActiveHandler()}
                confirmActivationHandler={() => this.onActiveDeActiveHandler()}
              /></Modal.Body>
            </Modal>
          </div>

        </Container>
      </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    SelectPaperItemId: (paperItemId) => dispatch(actions.SelectPaperItemId(paperItemId))
  };
};

export default connect(null, mapDispatchToProps)(ViewPaperItem);