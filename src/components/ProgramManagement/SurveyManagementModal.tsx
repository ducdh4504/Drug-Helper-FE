import React from "react"
import { Modal, Alert, Typography, Divider, Tag, Form, Select, Button, Space } from "antd"
import type { Surveys } from "../../types/interfaces/Surveys"
import { SurveyTypeEnum } from "../../types/enums/SurveyTypeEnum"

interface SurveyManagementModalProps {
  visible: boolean
  onCancel: () => void
  selectedProgram: any
  surveyForm: any
  handleLinkSurvey: (values: any) => void
  availableSurveys: Surveys[]
  linkedSurveys: any[]
  linkedSurveyDetails: any[]
  surveyLoading: boolean
  getSurveyTypeText: (type: SurveyTypeEnum) => string
}

const SurveyManagementModal: React.FC<SurveyManagementModalProps> = ({
  visible,
  onCancel,
  selectedProgram,
  surveyForm,
  handleLinkSurvey,
  availableSurveys,
  linkedSurveys,
  linkedSurveyDetails,
  surveyLoading,
  getSurveyTypeText,
}) => (
  <Modal
    title={`Manage Surveys - ${selectedProgram?.name || ""}`}
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={800}
  >
    <div style={{ marginBottom: 24 }}>
      <Alert
        message="Survey Linking Rules"
        description="Each program can have maximum 2 surveys: 1 Pre-survey and 1 Post-survey"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Current Linked Surveys */}
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={4}>
          Currently Linked Surveys
        </Typography.Title>
        {surveyLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {linkedSurveyDetails.length > 0 ? (
              <div>
                {linkedSurveyDetails.map((survey, index) => (
                  <Tag
                    key={survey.surveyID || index}
                    color="blue"
                    style={{ margin: "4px 8px 4px 0" }}
                  >
                    {survey.title} ({getSurveyTypeText(survey.type)})
                  </Tag>
                ))}
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  Total linked: {linkedSurveyDetails.length}/2
                </div>
              </div>
            ) : (
              <div style={{ color: "#999" }}>No surveys linked yet</div>
            )}
          </div>
        )}
      </div>

      <Divider />

      {/* Link New Survey Form */}
      {linkedSurveys.length < 2 && (
        <div>
          <Typography.Title level={4}>Link New Survey</Typography.Title>
          <Form
            form={surveyForm}
            layout="vertical"
            onFinish={handleLinkSurvey}
          >
            <Form.Item
              name="surveyId"
              label="Select Survey"
              rules={[
                { required: true, message: "Please select a survey!" },
              ]}
            >
              <Select
                placeholder="Choose a survey to link"
                loading={surveyLoading}
                showSearch
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
              >
                {availableSurveys
                  .filter(
                    (survey) =>
                      !linkedSurveys.some(
                        (linked) => linked.surveyID === survey.surveyID
                      )
                  )
                  .map((survey) => (
                    <Select.Option
                      key={survey.surveyID}
                      value={survey.surveyID}
                    >
                      {survey.title} ({getSurveyTypeText(survey.type)})
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Link Survey
                </Button>
                <Button onClick={() => surveyForm.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}

      {linkedSurveys.length >= 2 && (
        <Alert
          message="Maximum surveys reached"
          description="This program already has 2 surveys linked. You cannot link more surveys."
          type="warning"
          showIcon
        />
      )}
    </div>
  </Modal>
)

export default SurveyManagementModal