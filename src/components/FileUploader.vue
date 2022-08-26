<template>
  <div v-if="showUpload">
    <div class="button">
      <el-button
        type="success"
        @click="onSubmit"
        :disabled="uploadFiles.length == 0"
      >
        <el-icon>
          <Tools />
        </el-icon>
        <span> Start Process </span>
      </el-button>
    </div>
    <div class="upload">
      <el-upload
        multiple
        show
        :show-file-list="true"
        method="post"
        list-type="text"
        accept="image/jpeg,image/png"
        :on-change="onUploadChange"
        :on-remove="onRemoveFile"
        :auto-upload="false"
        action=""
        ref="upload"
      >
        <el-button type="primary">
          <el-icon>
            <UploadFilled />
          </el-icon>
          <span> Upload Files </span>
        </el-button>
      </el-upload>
    </div>
  </div>
  <div class="process_container" v-if="!showUpload && !showResult">
    <el-progress
      class="progress_bar"
      :text-inside="true"
      :stroke-width="24"
      :percentage="filePercentage"
      :format="progressText"
      status="warning"
      color="#85ce61"
    />
    <div class="prompt">
      <span>Click these missing cells with content</span>
    </div>
    <div class="viewer">
      <el-image :src="imageURL" fit="contain" style="height: 100%" />
    </div>
    <div class="table">
      <el-table
        style="height: 100%"
        :data="tableData"
        border
        @cell-click="cellClick"
        size="small"
        :header-cell-style="tableClass"
        :cell-style="tableClass"
        v-loading="tableData == null"
      >
        <el-table-column prop="0" label="姓名" />
        <el-table-column prop="1" label="签到" />
        <el-table-column prop="3" label="姓名" />
        <el-table-column prop="4" label="签到" />
        <el-table-column prop="6" label="姓名" />
        <el-table-column prop="7" label="签到" />
      </el-table>
    </div>
    <div class="confirm">
      <el-button
        class="confirm"
        type="success"
        @click="onConfirm"
        :disabled="tableData == null"
        >Confirm</el-button
      >
      <el-button
        class="confirm"
        type="primary"
        @click="onSkip"
        :disabled="tableData == null"
        >Skip</el-button
      >
      <div class="more_upload">
        <el-upload
          style="display: inline-block"
          multiple
          :show-file-list="false"
          method="post"
          list-type="text"
          accept="image/jpeg,image/png"
          :on-change="onMoreUpload"
          :auto-upload="false"
          :disabled="tableData == null"
          action=""
          ref="more_upload"
        >
          <el-button class="confirm" type="info" :disabled="tableData == null"
            >Add files</el-button
          >
        </el-upload>
        <el-button class="back" @click="reInit" :disabled="tableData == null"
          >Back</el-button
        >
      </div>
    </div>
  </div>
  <div v-if="showResult" style="height: 700px">
    <div class="result"><span>Result</span></div>
    <el-table
      style="height: 100%"
      class="result_table"
      :data="countingResult"
      border
      :header-cell-style="tableClass"
      :cell-style="tableClass"
      :default-sort="{ prop: '缺勤次数', order: 'descending' }"
      @selection-change="onMerge"
      v-loading="countingResult == null"
    >
      <el-table-column type="selection" />
      <el-table-column prop="姓名" label="姓名" />
      <el-table-column prop="缺勤次数" sortable label="缺勤次数" />
    </el-table>
    <div class="merge_result">
      <el-button
        type="primary"
        @click="mergeResult"
        :disabled="selectResult.length < 2"
        >Merge</el-button
      >
      <el-button type="success" @click="exportFile">Export</el-button>
      <el-button @click="reInit">Back</el-button>
    </div>
  </div>
</template>

<script>
import { UploadFilled, Tools } from '@element-plus/icons-vue'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'

export default {
  name: 'FileUploader',
  components: {
    UploadFilled, Tools
  },
  data () {
    return {
      uploadFiles: [],
      filePrefix: [],
      fileUID: [],
      showUpload: true,
      showResult: false,
      imageURL: null,
      currentIdx: 0,
      filePercentage: 0,
      tableData: null,
      totalData: [],
      selectResult: [],
      countingResult: null,
      tableClass: {
        'text-align': 'center',
      }
    }
  },
  created () {
    this.getToken()
  },
  methods: {
    onUploadChange (file) {
      const isIMAGE = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png')
      const isLt4M = file.size / 1024 / 1024 < 4

      if (!isIMAGE) {
        this.$message.error('只能上传jpg/png图片')
        return false
      }
      if (!isLt4M) {
        this.$message.error('单个图片大小不能超过4MB')
        return false
      }
      var reader = new FileReader()
      reader.onload = (event) => {
        var base64_str = event.currentTarget.result.split(',')
        this.uploadFiles.push(base64_str[1])
        this.filePrefix.push(base64_str[0] + ',')
        this.fileUID.push(file.uid)
        this.filePercentage = (this.currentIdx / this.uploadFiles.length) * 100
      }
      reader.readAsDataURL(file.raw)
    },
    onMoreUpload (file, files) {
      this.onUploadChange(file, files)
      if (document.getElementsByClassName('el-message').length == 0) {
        this.$message({
          message: "The files have been added",
          type: "success"
        })
      }
    },
    onRemoveFile (uploadFile) {
      const idx = this.fileUID.indexOf(uploadFile.uid)
      this.fileUID.splice(idx, 1)
      this.uploadFiles.splice(idx, 1)
      this.filePrefix.splice(idx, 1)
    },
    getToken () {
      const params = {
        'grant_type': 'client_credentials',
        'client_id': this.$config.API_KEY,
        'client_secret': this.$config.SECRET_KEY
      }
      this.$axios.get(this.$config.TOKEN_URL, {
        params: params
      })
        .then(response => {
          if ('access_token' in response.data && 'scope' in response.data) {
            if (response.data.scope.split(' ').indexOf('brain_all_scope') >= 0) {
              this.access_token = response.data.access_token
            }
            else {
              this.$message.error('Please check the availability of the OCR service')
            }
          }
          else {
            this.$message.error('Please set the correct API_KEY and SECRET_KEY in the config file')
          }
        })
        .catch(() => {
          this.$message.error('Failed to get the access token')
        })
    },
    getResult (idx) {
      const base64_data = this.filePrefix[idx] + this.uploadFiles[idx]

      this.$axios.post(this.$config.OCR_URL, this.$qs.stringify({
        'image': base64_data
      }), {
        params: {
          'access_token': this.access_token,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).then(response => {
        let table_data = {}
        let max_col = 0
        let max_row = 0
        let data = response.data.tables_result[0].body
        for (const cell of data) {
          let row = cell['row_start']
          if (row > 0) {
            row--
            const col = cell['col_start']
            const words = cell['words']
            if (col == 0 || col == 3 || col == 6) {
              for (const word of words.split('\n')) {
                max_col = Math.max(col, max_col)
                max_row = Math.max(row, max_row)
                if (!(row in table_data)) {
                  table_data[row] = { 'idx': row }
                }
                table_data[row][col.toString()] = word
                row++
              }
            }
            else {
              max_col = Math.max(col, max_col)
              max_row = Math.max(row, max_row)
              if (!(row in table_data)) {
                table_data[row] = { 'idx': row }
              }
              table_data[row][col.toString()] = words
            }
          }
        }
        this.tableData = Object.values(table_data)
      }).catch(() => {
        this.$message.error('Failed to get OCR result')
      })
    },
    onSubmit () {
      this.imageURL = this.filePrefix[this.currentIdx] + this.uploadFiles[this.currentIdx]
      this.showUpload = false
      this.getResult(this.currentIdx)
    },
    progressText () {
      return this.currentIdx + '/' + this.uploadFiles.length
    },
    onConfirm () {
      this.totalData.push(JSON.parse(JSON.stringify(this.tableData)))
      this.tableData = null
      this.currentIdx++
      if (this.currentIdx >= this.uploadFiles.length) {
        this.showResult = true
        this.finalCount()
      }
      else {
        this.imageURL = this.filePrefix[this.currentIdx] + this.uploadFiles[this.currentIdx]
        this.filePercentage = (this.currentIdx / this.uploadFiles.length) * 100
        this.getResult(this.currentIdx)
      }
    },
    onSkip () {
      this.tableData = null
      this.currentIdx++
      if (this.currentIdx >= this.uploadFiles.length) {
        this.showResult = true
        this.finalCount()
      }
      else {
        this.imageURL = this.filePrefix[this.currentIdx] + this.uploadFiles[this.currentIdx]
        this.filePercentage = (this.currentIdx / this.uploadFiles.length) * 100
        this.getResult(this.currentIdx)
      }
    },
    cellClick (row, col) {
      const click_row = row.idx
      const click_col = col.property
      if (col.label == '签到') {
        if (this.tableData[click_row][click_col] == '') {
          this.tableData[click_row][click_col] = '√'
        }
        else {
          this.tableData[click_row][click_col] = ''
        }
      }
    },
    finalCount () {
      let counter = {}
      for (const table of this.totalData) {
        for (const row of table) {
          for (const col of [0, 3, 6]) {
            if (row[col] != '' && row[col + 1] == '') {
              if (!(row[col] in counter)) {
                counter[row[col]] = 0
              }
              counter[row[col]]++
            }
          }
        }
      }
      let counting_result = []
      for (const k in counter) {
        counting_result.push({
          '姓名': k,
          '缺勤次数': counter[k]
        })
      }
      this.countingResult = counting_result
    },
    onMerge (selection) {
      this.selectResult = selection
    },
    mergeResult () {
      let total_count = 0
      const total_name = this.selectResult[0]['姓名']
      for (const result of this.selectResult) {
        total_count += result['缺勤次数']
      }
      for (const result of this.selectResult) {
        const idx = this.countingResult.indexOf(result)
        this.countingResult.splice(idx, 1)
      }
      this.countingResult.push({ '姓名': total_name, '缺勤次数': total_count })
    },
    exportFile () {
      let wb = XLSX.utils.book_new()
      let sheet = XLSX.utils.json_to_sheet(this.countingResult)
      XLSX.utils.book_append_sheet(wb, sheet)
      let wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: 'application/octet-stream' }),
          'result.xlsx'
        )
      } catch (e) {
        this.$message.error('Failed to export the excel file')
      }
      return wbout
    },
    reInit () {
      this.uploadFiles = []
      this.filePrefix = []
      this.fileUID = []
      this.imageURL = null
      this.currentIdx = 0
      this.filePercentage = 0
      this.tableData = null
      this.totalData = []
      this.selectResult = []
      this.countingResult = null
      this.showResult = false
      this.showUpload = true
    }
  }
}
</script>

<style scoped>
.upload {
  float: left;
  margin-top: 50px;
  margin-left: 12px;
  width: 300px;
}
.button {
  float: left;
  margin-top: 50px;
  margin-left: 50px;
}
.process_container {
  height: 700px;
  padding: 0 5%;
}
.viewer {
  padding-right: 5px;
  width: 50%;
  height: 100%;
  display: inline-block;
  border-style: solid;
  border-width: 1px;
  border-color: #e7eaf2;
  box-sizing: border-box;
}
.progress_bar {
  margin: 40px 5% 0 5%;
}
.table {
  display: inline-block;
  width: 50%;
  height: 100%;
  padding-left: 5px;
  border-width: 1px;
  border-style: solid;
  border-color: white;
  box-sizing: border-box;
  vertical-align: top;
}
.confirm {
  margin-top: 20px;
  text-align: right;
}
.more_upload {
  float: right;
  margin-left: 12px;
}
.back {
  display: inline-block;
  margin-left: 12px;
}

.prompt {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #8d9095;
  margin-bottom: 10px;
  margin-top: 10px;
  font-weight: bold;
  vertical-align: top;
}

.result {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  font-weight: bold;
  font-size: 30px;
  line-height: 60px;
  text-align: center;
  color: black;
  margin-top: 10px;
  margin-bottom: 10px;
}

.result_table {
  width: 40%;
  margin: 0 auto;
}

.merge_result {
  text-align: center;
  margin-top: 20px;
  display: block;
}

:deep() .el-progress-bar__innerText {
  color: #1d1d1d;
}
</style>